import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { w as withCors } from "./cors-BIye2o2q.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
import { b as buildCreditProfile } from "./credit-D7CD7JTP.mjs";
import { c as createNotification } from "./notifications-D27_zi3Y.mjs";
import "../_commonjsHelpers-CCIqAdii.mjs";
import "crypto";
import "fs";
import "path";
import "node:fs";
import "node:path";
import "node:dns";
import "events";
import "util/types";
import "util";
import "dns";
import "net";
import "tls";
import "stream";
import "string_decoder";
async function handler(req, res) {
  if (req.method === "GET") {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: "farmerId is required" });
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
    const loans2 = db.loans.filter((loan) => loan.farmerId === farmerId);
    return res.status(200).json({ loans: loans2 });
  }
  if (req.method === "POST") {
    const { farmerId, amount, currency = "KES", termMonths = 12, action, repayAmount } = req.body;
    if (action === "repay") {
      if (!farmerId || !repayAmount) return res.status(400).json({ error: "farmerId and repayAmount are required" });
      const amountNumber2 = Number(repayAmount);
      if (isNaN(amountNumber2) || amountNumber2 <= 0) return res.status(400).json({ error: "Invalid repayAmount" });
      if (useSupabase()) {
        await ensureCoreSchema();
        const loanResult = await query(`SELECT id, amount, repaid_amount AS "repaidAmount", status FROM loans WHERE farmer_id = $1 ORDER BY requested_at DESC LIMIT 1`, [farmerId]);
        if (loanResult.rowCount === 0) return res.status(404).json({ error: "Loan not found" });
        const loan3 = loanResult.rows[0];
        const newRepaid = Number(loan3.repaidAmount || 0) + amountNumber2;
        const newStatus = newRepaid >= Number(loan3.amount) ? "repaid" : loan3.status;
        await query(`UPDATE loans SET repaid_amount = $1, status = $2 WHERE id = $3`, [newRepaid, newStatus, loan3.id]);
        return res.status(200).json({ loan: { ...loan3, repaidAmount: newRepaid, status: newStatus } });
      }
      const db2 = readLocalDb();
      const loan2 = db2.loans.slice().reverse().find((l) => l.farmerId === farmerId);
      if (!loan2) return res.status(404).json({ error: "Loan not found" });
      loan2.repaidAmount = (loan2.repaidAmount || 0) + amountNumber2;
      loan2.status = loan2.repaidAmount >= loan2.amount ? "repaid" : loan2.status;
      writeLocalDb(db2);
      return res.status(200).json({ loan: loan2 });
    }
    if (!farmerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "farmerId and positive amount are required" });
    }
    const amountNumber = Number(amount);
    const id = v4();
    const requestedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (useSupabase()) {
      await ensureCoreSchema();
      const farmerResult = await query(
        `SELECT id, phone, name, stellar_public_key AS "stellarPublicKey", credit_score AS "creditScore", credit_tier AS "creditTier", coop_id AS "coopId", coop_role AS "coopRole"
         FROM farmers WHERE id = $1 LIMIT 1`,
        [farmerId]
      );
      if (farmerResult.rowCount === 0) return res.status(404).json({ error: "Farmer not found" });
      const farmer2 = farmerResult.rows[0];
      const goalsResult = await query(`SELECT id, target_amount AS "targetAmount", balance FROM goals WHERE farmer_id = $1`, [farmerId]);
      const withdrawalsResult = await query(`SELECT id FROM withdrawal_requests WHERE farmer_id = $1`, [farmerId]);
      const loansResult = await query(`SELECT id, amount, status, repaid_amount AS "repaidAmount" FROM loans WHERE farmer_id = $1`, [farmerId]);
      const transactionsResult = await query(`SELECT id, amount FROM transactions WHERE farmer_id = $1`, [farmerId]);
      const profile2 = buildCreditProfile(
        farmer2,
        goalsResult.rows,
        transactionsResult.rows,
        withdrawalsResult.rows,
        loansResult.rows
      );
      const recommendedMax2 = Math.min(2e4, Math.max(0, profile2.totalSaved * 0.3 + profile2.score * 2));
      const approved2 = profile2.score >= 620 && amountNumber <= recommendedMax2;
      const status2 = approved2 ? "approved" : "pending";
      const dueDate2 = /* @__PURE__ */ new Date();
      dueDate2.setMonth(dueDate2.getMonth() + Number(termMonths));
      await query(
        `INSERT INTO loans (id, farmer_id, amount, currency, term_months, status, requested_at, approved_at, due_date, repaid_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, farmerId, amountNumber, currency, termMonths, status2, requestedAt, approved2 ? requestedAt : null, approved2 ? dueDate2.toISOString() : null, 0]
      );
      if (approved2) {
        await query(`UPDATE farmers SET credit_score = $1, credit_tier = $2 WHERE id = $3`, [profile2.score, profile2.tier, farmerId]);
      }
      if (approved2) {
        await createNotification(farmerId, "loan", "Loan approved", `Your loan for KES ${amountNumber.toLocaleString()} has been approved.`);
      }
      return res.status(201).json({ loan: { id, farmerId, amount: amountNumber, currency, termMonths, status: status2, requestedAt, approvedAt: approved2 ? requestedAt : null, dueDate: approved2 ? dueDate2.toISOString() : null, repaidAmount: 0 } });
    }
    const db = readLocalDb();
    const farmer = db.farmers.find((f) => f.id === farmerId);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    const goals = db.goals.filter((g) => g.farmerId === farmerId);
    const withdrawals = db.withdrawalRequests.filter((w) => w.farmerId === farmerId);
    const loans2 = db.loans.filter((l) => l.farmerId === farmerId);
    const profile = buildCreditProfile(farmer, goals, db.transactions.filter((t) => t.farmerId === farmerId), withdrawals, loans2);
    const recommendedMax = Math.min(2e4, Math.max(0, profile.totalSaved * 0.3 + profile.score * 2));
    const approved = profile.score >= 620 && amountNumber <= recommendedMax;
    const status = approved ? "approved" : "pending";
    const dueDate = /* @__PURE__ */ new Date();
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
      repaidAmount: 0
    };
    db.loans.push(loan);
    writeLocalDb(db);
    if (approved) {
      await createNotification(farmerId, "loan", "Loan approved", `Your loan for KES ${amountNumber.toLocaleString()} has been approved.`);
    }
    return res.status(201).json({ loan });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
const loans = withCors(handler);
export {
  loans as default
};
