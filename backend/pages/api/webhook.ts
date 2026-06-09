import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { invokeSorobanAllocation } from '../../lib/stellar';
import { withCors } from '../../lib/cors';
import { getSorobanConfig } from '../../lib/soroban-config';
import { query, useSupabase } from '../../lib/db';

const DB = path.join(process.cwd(), 'data', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function writeDB(data: any) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// Process an incoming payment and allocate to goals according to rules
// Also invokes Soroban allocation contract for on-chain tracking
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { publicKey, amount, memo, contractId } = req.body;
  if (!publicKey || !amount) return res.status(400).json({ error: 'publicKey and amount required' });

  let farmer: any;
  let allocations: any[] = [];

  if (useSupabase()) {
    const farmerResult = await query(
      `SELECT id, stellar_public_key AS "stellarPublicKey" FROM farmers WHERE stellar_public_key = $1 LIMIT 1`,
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
  } else {
    const db = readDB();
    farmer = db.farmers.find((f: any) => f.stellarPublicKey === publicKey);
    if (!farmer) return res.status(404).json({ error: 'farmer not found' });

    allocations = farmer.allocationRules.map((r: any) => ({ key: r.key, pct: r.pct, amount: Math.round((r.pct / 100) * amount) }));
    allocations.forEach((a: any) => {
      const goal = db.goals.find((g: any) => g.farmerId === farmer.id && g.name.toLowerCase().includes(a.key));
      if (goal) {
        goal.balance += a.amount;
      }
    });

    db.transactions.push({
      id: Date.now(),
      farmerId: farmer.id,
      amount,
      allocations,
      memo: memo || null,
      createdAt: new Date().toISOString(),
    });
    writeDB(db);
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

  if (useSupabase()) {
    await query(
      `INSERT INTO transactions (farmer_id, amount, memo, allocations, stellar_tx_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [farmer.id, amount, memo || null, allocations, contractResult?.txHash || null, new Date().toISOString()]
    );
  }

  return res.status(200).json({
    status: 'allocated',
    allocations,
    contractInvoked: contractResult?.contractInvoked || false,
    txHash: contractResult?.txHash || null,
  });
}

export default withCors(handler);
