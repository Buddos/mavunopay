import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { w as withCors } from "./cors-BIye2o2q.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
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
        `SELECT id, farmer_id AS "farmerId", name, description, target_amount AS "targetAmount", balance, currency, target_date AS "targetDate", locked, unlock_date AS "unlockDate", created_at AS "createdAt"
         FROM goals WHERE farmer_id = $1 ORDER BY created_at DESC`,
        [farmerId]
      );
      return res.status(200).json({ goals: result.rows });
    }
    const db = readLocalDb();
    const goals2 = db.goals.filter((g) => g.farmerId === farmerId);
    return res.status(200).json({ goals: goals2 });
  }
  if (req.method === "POST") {
    const { farmerId, name, description, targetAmount, currency = "KES", targetDate, locked = false, unlockDate } = req.body;
    if (!farmerId || !name || !targetAmount) return res.status(400).json({ error: "farmerId, name, targetAmount required" });
    const goal = {
      id: v4(),
      farmerId,
      name,
      description: description || null,
      targetAmount,
      balance: 0,
      currency,
      targetDate: targetDate || null,
      locked: Boolean(locked),
      unlockDate: unlockDate || null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `INSERT INTO goals (id, farmer_id, name, description, target_amount, balance, currency, target_date, locked, unlock_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, farmer_id AS "farmerId", name, description, target_amount AS "targetAmount", balance, currency, target_date AS "targetDate", locked, unlock_date AS "unlockDate", created_at AS "createdAt"`,
        [goal.id, farmerId, name, goal.description, targetAmount, 0, currency, goal.targetDate, goal.locked, goal.unlockDate, goal.createdAt]
      );
      return res.status(201).json({ goal: result.rows[0] });
    }
    const db = readLocalDb();
    db.goals.push(goal);
    writeLocalDb(db);
    return res.status(201).json({ goal });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
const goals = withCors(handler);
export {
  goals as default
};
