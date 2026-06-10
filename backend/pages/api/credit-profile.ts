import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { buildCreditProfile } from '../../lib/credit';
import { readLocalDb } from '../../lib/local-db';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
  const exportCsv = req.query.export === 'csv';

  if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

  let farmer: any;
  let goals: any[] = [];
  let transactions: any[] = [];
  let withdrawals: any[] = [];
  let loans: any[] = [];

  if (useSupabase()) {
    await ensureCoreSchema();
    const farmerResult = await query(
      `SELECT id, phone, name, stellar_public_key AS "stellarPublicKey", credit_score AS "creditScore", credit_tier AS "creditTier", coop_id AS "coopId", coop_role AS "coopRole"
       FROM farmers WHERE id = $1 LIMIT 1`,
      [farmerId]
    );
    if (farmerResult.rowCount === 0) return res.status(404).json({ error: 'farmer not found' });
    farmer = farmerResult.rows[0];
    const goalsResult = await query(
      `SELECT id, farmer_id AS "farmerId", name, description, target_amount AS "targetAmount", balance, currency, target_date AS "targetDate", locked, unlock_date AS "unlockDate", created_at AS "createdAt"
       FROM goals WHERE farmer_id = $1`,
      [farmerId]
    );
    goals = goalsResult.rows;
    const txResult = await query(
      `SELECT id, farmer_id AS "farmerId", amount, memo, asset_code AS "assetCode", asset_issuer AS "assetIssuer", group_payment AS "groupPayment", allocations, created_at AS "createdAt"
       FROM transactions WHERE farmer_id = $1`,
      [farmerId]
    );
    transactions = txResult.rows;
    const withdrawalResult = await query(
      `SELECT id, farmer_id AS "farmerId", goal_id AS "goalId", amount, currency, status, type, memo, requested_at AS "requestedAt", processed_at AS "processedAt"
       FROM withdrawal_requests WHERE farmer_id = $1`,
      [farmerId]
    );
    withdrawals = withdrawalResult.rows;
    const loanResult = await query(
      `SELECT id, farmer_id AS "farmerId", amount, currency, term_months AS "termMonths", status, requested_at AS "requestedAt", approved_at AS "approvedAt", due_date AS "dueDate", repaid_amount AS "repaidAmount"
       FROM loans WHERE farmer_id = $1`,
      [farmerId]
    );
    loans = loanResult.rows;
  } else {
    const db = readLocalDb();
    farmer = db.farmers.find((f: any) => f.id === farmerId);
    if (!farmer) return res.status(404).json({ error: 'farmer not found' });
    goals = db.goals.filter((g: any) => g.farmerId === farmerId);
    transactions = db.transactions.filter((t: any) => t.farmerId === farmerId);
    withdrawals = db.withdrawalRequests.filter((w: any) => w.farmerId === farmerId);
    loans = db.loans.filter((l: any) => l.farmerId === farmerId);
  }

  const profile = buildCreditProfile(farmer, goals, transactions, withdrawals, loans);

  if (exportCsv) {
    const csvLines = [
      'Field,Value',
      `Farmer ID,${profile.farmerId}`,
      `Credit Score,${profile.score}`,
      `Credit Tier,${profile.tier}`,
      `Total Saved,${profile.totalSaved}`,
      `Completed Goals,${profile.completedGoals}`,
      `Pending Withdrawals,${profile.pendingWithdrawals}`,
      `Active Loan,${profile.activeLoan ? profile.activeLoan.amount : 'None'}`,
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="credit-profile.csv"');
    return res.send(csvLines.join('\n'));
  }

  return res.status(200).json({ profile });
}

export default withCors(handler);
