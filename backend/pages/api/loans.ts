import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';
import { buildCreditProfile } from '../../lib/credit';
import { createNotification } from '../../lib/notifications';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `SELECT id, farmer_id AS "farmerId", amount, currency, term_months AS "termMonths", status, requested_at AS "requestedAt", approved_at AS "approvedAt", due_date AS "dueDate", repaid_amount AS "repaidAmount"
         FROM loans WHERE farmer_id = $1 ORDER BY requested_at DESC`,
        [farmerId]
      );
      return res.status(200).json({ loans: result.rows });
    }

    const db = readLocalDb();
    const loans = db.loans.filter((loan: any) => loan.farmerId === farmerId);
    return res.status(200).json({ loans });
  }

  if (req.method === 'POST') {
    const { farmerId, amount, currency = 'KES', termMonths = 12, action, repayAmount } = req.body;
    if (action === 'repay') {
      if (!farmerId || !repayAmount) return res.status(400).json({ error: 'farmerId and repayAmount are required' });
      const amountNumber = Number(repayAmount);
      if (isNaN(amountNumber) || amountNumber <= 0) return res.status(400).json({ error: 'Invalid repayAmount' });

      if (useSupabase()) {
        await ensureCoreSchema();
        const loanResult = await query(`SELECT id, amount, repaid_amount AS "repaidAmount", status FROM loans WHERE farmer_id = $1 ORDER BY requested_at DESC LIMIT 1`, [farmerId]);
        if (loanResult.rowCount === 0) return res.status(404).json({ error: 'Loan not found' });
        const loan = loanResult.rows[0];
        const newRepaid = Number(loan.repaidAmount || 0) + amountNumber;
        const newStatus = newRepaid >= Number(loan.amount) ? 'repaid' : loan.status;
        await query(`UPDATE loans SET repaid_amount = $1, status = $2 WHERE id = $3`, [newRepaid, newStatus, loan.id]);
        return res.status(200).json({ loan: { ...loan, repaidAmount: newRepaid, status: newStatus } });
      }

      const db = readLocalDb();
      const loan = db.loans.slice().reverse().find((l: any) => l.farmerId === farmerId);
      if (!loan) return res.status(404).json({ error: 'Loan not found' });
      loan.repaidAmount = (loan.repaidAmount || 0) + amountNumber;
      loan.status = loan.repaidAmount >= loan.amount ? 'repaid' : loan.status;
      writeLocalDb(db);
      return res.status(200).json({ loan });
    }

    if (!farmerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'farmerId and positive amount are required' });
    }
    const amountNumber = Number(amount);
    const id = uuidv4();
    const requestedAt = new Date().toISOString();

    if (useSupabase()) {
      await ensureCoreSchema();
      const farmerResult = await query(
        `SELECT id, phone, name, stellar_public_key AS "stellarPublicKey", credit_score AS "creditScore", credit_tier AS "creditTier", coop_id AS "coopId", coop_role AS "coopRole"
         FROM farmers WHERE id = $1 LIMIT 1`,
        [farmerId]
      );
      if (farmerResult.rowCount === 0) return res.status(404).json({ error: 'Farmer not found' });
      const farmer = farmerResult.rows[0];
      const goalsResult = await query(`SELECT id, target_amount AS "targetAmount", balance FROM goals WHERE farmer_id = $1`, [farmerId]);
      const withdrawalsResult = await query(`SELECT id FROM withdrawal_requests WHERE farmer_id = $1`, [farmerId]);
      const loansResult = await query(`SELECT id, amount, status, repaid_amount AS "repaidAmount" FROM loans WHERE farmer_id = $1`, [farmerId]);
      const transactionsResult = await query(`SELECT id, amount FROM transactions WHERE farmer_id = $1`, [farmerId]);
      const profile = buildCreditProfile(
        farmer,
        goalsResult.rows,
        transactionsResult.rows,
        withdrawalsResult.rows,
        loansResult.rows
      );
      const recommendedMax = Math.min(20000, Math.max(0, profile.totalSaved * 0.3 + profile.score * 2));
      const approved = profile.score >= 620 && amountNumber <= recommendedMax;
      const status = approved ? 'approved' : 'pending';
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + Number(termMonths));
      await query(
        `INSERT INTO loans (id, farmer_id, amount, currency, term_months, status, requested_at, approved_at, due_date, repaid_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, farmerId, amountNumber, currency, termMonths, status, requestedAt, approved ? requestedAt : null, approved ? dueDate.toISOString() : null, 0]
      );
      if (approved) {
        await query(`UPDATE farmers SET credit_score = $1, credit_tier = $2 WHERE id = $3`, [profile.score, profile.tier, farmerId]);
      }
      if (approved) {
        await createNotification(farmerId, 'loan', 'Loan approved', `Your loan for KES ${amountNumber.toLocaleString()} has been approved.`);
      }
      return res.status(201).json({ loan: { id, farmerId, amount: amountNumber, currency, termMonths, status, requestedAt, approvedAt: approved ? requestedAt : null, dueDate: approved ? dueDate.toISOString() : null, repaidAmount: 0 } });
    }

    const db = readLocalDb();
    const farmer = db.farmers.find((f: any) => f.id === farmerId);
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    const goals = db.goals.filter((g: any) => g.farmerId === farmerId);
    const withdrawals = db.withdrawalRequests.filter((w: any) => w.farmerId === farmerId);
    const loans = db.loans.filter((l: any) => l.farmerId === farmerId);
    const profile = buildCreditProfile(farmer, goals, db.transactions.filter((t: any) => t.farmerId === farmerId), withdrawals, loans);
    const recommendedMax = Math.min(20000, Math.max(0, profile.totalSaved * 0.3 + profile.score * 2));
    const approved = profile.score >= 620 && amountNumber <= recommendedMax;
    const status = approved ? 'approved' : 'pending';
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + Number(termMonths));
    const loan = {
      id,
      farmerId,
      amount: amountNumber,
      currency,
      termMonths: Number(termMonths),
      status,
      requestedAt,
      approvedAt: approved ? requestedAt : null,
      dueDate: approved ? dueDate.toISOString() : null,
      repaidAmount: 0,
    };
    db.loans.push(loan);
    writeLocalDb(db);
    if (approved) {
      await createNotification(farmerId, 'loan', 'Loan approved', `Your loan for KES ${amountNumber.toLocaleString()} has been approved.`);
    }
    return res.status(201).json({ loan });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
