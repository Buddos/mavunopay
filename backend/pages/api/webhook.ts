import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { invokeSorobanAllocation } from '../../lib/stellar';
import { withCors } from '../../lib/cors';
import { getSorobanConfig } from '../../lib/soroban-config';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';
import { createNotification } from '../../lib/notifications';
import { validateTransactionConfirmation, classifyPaymentSource } from '../../lib/horizon-listener';

// Process an incoming payment and allocate to goals according to rules
// Also invokes Soroban allocation contract for on-chain tracking
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { publicKey, amount, memo, contractId, assetCode, assetIssuer, groupPayment, transactionHash } = req.body;
  if (!publicKey || !amount) return res.status(400).json({ error: 'publicKey and amount required' });

  let farmer: any;
  let allocations: any[] = [];
  let transaction: any = null;
  let validationResult: any = null;
  let sourceClassification = classifyPaymentSource(memo);

  if (transactionHash) {
    try {
      validationResult = await validateTransactionConfirmation(transactionHash);
    } catch (err) {
      console.warn(`Payment confirmation check failed for ${transactionHash}:`, err);
    }
  }

  if (useSupabase()) {
    await ensureCoreSchema();
    const farmerResult = await query(
      `SELECT id, stellar_public_key AS "stellarPublicKey", coop_id AS "coopId" FROM farmers WHERE stellar_public_key = $1 LIMIT 1`,
      [publicKey]
    );
    if (farmerResult.rowCount === 0) return res.status(404).json({ error: 'farmer not found' });
    farmer = farmerResult.rows[0];

    const rulesResult = await query(
      `SELECT key, pct FROM allocation_rules WHERE farmer_id = $1 ORDER BY created_at`,
      [farmer.id]
    );
    allocations = rulesResult.rows.map((r: any) => ({ key: r.key, pct: r.pct, amount: Math.round((r.pct / 100) * amount) }));

    for (const alloc of allocations) {
      const pattern = `%${alloc.key.toLowerCase()}%`;
      await query(
        `UPDATE goals SET balance = balance + $1 WHERE farmer_id = $2 AND lower(name) LIKE $3`,
        [alloc.amount, farmer.id, pattern]
      );
    }

    if (groupPayment && farmer.coopId) {
      await query(`UPDATE cooperatives SET savings_balance = savings_balance + $1 WHERE id = $2`, [amount, farmer.coopId]);
    }

    transaction = {
      id: uuidv4(),
      farmerId: farmer.id,
      amount,
      memo: memo || null,
      assetCode: assetCode || null,
      assetIssuer: assetIssuer || null,
      groupPayment: Boolean(groupPayment),
      allocations,
      transactionHash: transactionHash || null,
      validation: validationResult || null,
      classification: sourceClassification,
      createdAt: new Date().toISOString(),
    };
  } else {
    const db = readLocalDb();
    farmer = db.farmers.find((f: any) => f.stellarPublicKey === publicKey);
    if (!farmer) return res.status(404).json({ error: 'farmer not found' });

    allocations = farmer.allocationRules.map((r: any) => ({ key: r.key, pct: r.pct, amount: Math.round((r.pct / 100) * amount) }));
    allocations.forEach((a: any) => {
      const goal = db.goals.find((g: any) => g.farmerId === farmer.id && g.name.toLowerCase().includes(a.key));
      if (goal) {
        goal.balance += a.amount;
      }
    });

    if (groupPayment && farmer.coopId) {
      const coop = db.cooperatives.find((c: any) => c.id === farmer.coopId);
      if (coop) coop.savingsBalance = (coop.savingsBalance || 0) + Number(amount);
    }

    const tx = {
      id: uuidv4(),
      farmerId: farmer.id,
      amount,
      memo: memo || null,
      assetCode: assetCode || null,
      assetIssuer: assetIssuer || null,
      groupPayment: Boolean(groupPayment),
      allocations,
      transactionHash: transactionHash || null,
      validation: validationResult || null,
      classification: sourceClassification,
      createdAt: new Date().toISOString(),
    };
    db.transactions.push(tx);
    writeLocalDb(db);
    transaction = tx;
  }

  if (farmer?.id) {
    await createNotification(
      farmer.id,
      'payment',
      'Payment allocated',
      `KES ${Number(amount).toLocaleString()} has been allocated across your goals.`
    );
  }

  let contractResult = null;
  const finalContractId = contractId || process.env.SOROBAN_CONTRACT_ID;
  if (finalContractId) {
    try {
      const sorobanConfig = getSorobanConfig();
      if (sorobanConfig.enabled && sorobanConfig.contractId) {
        contractResult = await invokeSorobanAllocation(farmer.id, publicKey, amount, finalContractId);
        if (!contractResult.contractInvoked) {
          console.error(`Soroban contract invocation failed: ${contractResult.error}`);
        }
      }
    } catch (err) {
      console.error(`Soroban contract error: ${err}`);
    }
  }

  if (useSupabase() && transaction) {
    await query(
      `INSERT INTO transactions (id, farmer_id, amount, memo, asset_code, asset_issuer, group_payment, allocations, stellar_tx_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        transaction.id,
        transaction.farmerId,
        transaction.amount,
        transaction.memo,
        transaction.assetCode,
        transaction.assetIssuer,
        transaction.groupPayment,
        transaction.allocations,
        contractResult?.txHash || null,
        transaction.createdAt,
      ]
    );

    // If contract events were captured, write an audit log entry linking them to this transaction
    if (contractResult?.events && Array.isArray(contractResult.events) && contractResult.events.length > 0) {
      await query(
        `INSERT INTO audit_logs (actor_id, action, subject_type, subject_id, payload) VALUES ($1, $2, $3, $4, $5)`,
        [
          transaction.farmerId,
          'soroban_events',
          'transaction',
          transaction.id,
          contractResult.events,
        ]
      );
    }
  } else if (transaction) {
    // local DB: attach events into the transaction record
    const db = readLocalDb();
    if (contractResult?.events && Array.isArray(contractResult.events)) {
      const txIdx = db.transactions.findIndex((t: any) => t.id === transaction.id);
      if (txIdx >= 0) {
        db.transactions[txIdx].sorobanEvents = contractResult.events;
        writeLocalDb(db);
      }
    }
  }

  return res.status(200).json({
    status: 'allocated',
    allocations,
    contractInvoked: contractResult?.contractInvoked || false,
    txHash: contractResult?.txHash || null,
    sourceClassification,
    paymentValidated: Boolean(validationResult),
    sorobanEvents: contractResult?.events || [],
  });
}

export default withCors(handler);
