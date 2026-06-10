import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { w as withCors } from "./cors-BIye2o2q.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
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
        `SELECT id, farmer_id AS "farmerId", goal_id AS "goalId", amount, currency, status, type, memo, requested_at AS "requestedAt", processed_at AS "processedAt"
         FROM withdrawal_requests WHERE farmer_id = $1 ORDER BY requested_at DESC`,
        [farmerId]
      );
      return res.status(200).json({ withdrawals: result.rows });
    }
    const db = readLocalDb();
    const withdrawals2 = db.withdrawalRequests.filter((w) => w.farmerId === farmerId);
    return res.status(200).json({ withdrawals: withdrawals2 });
  }
  if (req.method === "POST") {
    const { farmerId, goalId, amount, currency = "KES", type = "standard", memo } = req.body;
    if (!farmerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "farmerId and positive amount are required" });
    }
    const requestedAt = (/* @__PURE__ */ new Date()).toISOString();
    const id = v4();
    if (useSupabase()) {
      await ensureCoreSchema();
      if (!goalId) return res.status(400).json({ error: "goalId is required for withdrawal" });
      const goalResult = await query(
        `SELECT id, balance, locked, unlock_date AS "unlockDate" FROM goals WHERE id = $1 AND farmer_id = $2 LIMIT 1`,
        [goalId, farmerId]
      );
      if (goalResult.rowCount === 0) return res.status(404).json({ error: "Goal not found" });
      const goal2 = goalResult.rows[0];
      const amountNumber2 = Number(amount);
      const locked = goal2.locked;
      const unlockDate2 = goal2.unlockDate ? new Date(goal2.unlockDate) : null;
      const mayWithdraw2 = !locked || type === "emergency" || !unlockDate2 || unlockDate2 <= /* @__PURE__ */ new Date();
      if (!mayWithdraw2) return res.status(400).json({ error: "Goal is locked until unlock date" });
      if (Number(goal2.balance) < amountNumber2) return res.status(400).json({ error: "Insufficient goal balance" });
      await query(`UPDATE goals SET balance = balance - $1 WHERE id = $2`, [amountNumber2, goalId]);
      await query(
        `INSERT INTO withdrawal_requests (id, farmer_id, goal_id, amount, currency, status, type, memo, requested_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, farmerId, goalId, amountNumber2, currency, "approved", type, memo || null, requestedAt]
      );
      return res.status(201).json({ withdrawal: { id, farmerId, goalId, amount: amountNumber2, currency, status: "approved", type, memo, requestedAt } });
    }
    const db = readLocalDb();
    const farmer = db.farmers.find((f) => f.id === farmerId);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    const goal = db.goals.find((g) => g.id === goalId && g.farmerId === farmerId);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    const amountNumber = Number(amount);
    const unlockDate = goal.unlockDate ? new Date(goal.unlockDate) : null;
    const mayWithdraw = !goal.locked || type === "emergency" || !unlockDate || unlockDate <= /* @__PURE__ */ new Date();
    if (!mayWithdraw) return res.status(400).json({ error: "Goal is locked until unlock date" });
    if (goal.balance < amountNumber) return res.status(400).json({ error: "Insufficient goal balance" });
    goal.balance -= amountNumber;
    const withdrawal = {
      id,
      farmerId,
      goalId: goalId || null,
      amount: amountNumber,
      currency,
      status: "approved",
      type: type === "emergency" ? "emergency" : "standard",
      memo: memo || null,
      requestedAt,
      processedAt: requestedAt
    };
    db.withdrawalRequests.push(withdrawal);
    writeLocalDb(db);
    await createNotification(farmerId, "withdrawal", "Withdrawal approved", `KES ${amountNumber.toLocaleString()} has been released from ${goal.name}.`);
    return res.status(201).json({ withdrawal });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
const withdrawals = withCors(handler);
export {
  withdrawals as default
};
