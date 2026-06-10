import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { w as withCors } from "./cors-BIye2o2q.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
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
function buildJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
async function handler(req, res) {
  if (req.method === "GET") {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: "farmerId is required" });
    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `SELECT id, name, description, join_code AS "joinCode", leader_id AS "leaderId", members, savings_balance AS "savingsBalance", created_at AS "createdAt"
         FROM cooperatives
         WHERE leader_id = $1 OR members::text LIKE $2`,
        [farmerId, `%${farmerId}%`]
      );
      return res.status(200).json({ cooperatives: result.rows });
    }
    const db = readLocalDb();
    const cooperatives2 = db.cooperatives.filter(
      (coop) => coop.leaderId === farmerId || Array.isArray(coop.members) && coop.members.includes(farmerId)
    );
    return res.status(200).json({ cooperatives: cooperatives2 });
  }
  if (req.method === "POST") {
    const { farmerId, action, name, description, joinCode } = req.body;
    if (!farmerId) return res.status(400).json({ error: "farmerId is required" });
    if (action === "join") {
      if (!joinCode) return res.status(400).json({ error: "joinCode is required to join a cooperative" });
      if (useSupabase()) {
        await ensureCoreSchema();
        const coopResult = await query(
          `SELECT id, members FROM cooperatives WHERE join_code = $1 LIMIT 1`,
          [joinCode]
        );
        if (coopResult.rowCount === 0) return res.status(404).json({ error: "Cooperative not found" });
        const coop3 = coopResult.rows[0];
        const members = Array.isArray(coop3.members) ? [...coop3.members] : [];
        if (!members.includes(farmerId)) members.push(farmerId);
        await query(`UPDATE cooperatives SET members = $1 WHERE id = $2`, [members, coop3.id]);
        await query(`UPDATE farmers SET coop_id = $1, coop_role = 'member' WHERE id = $2`, [coop3.id, farmerId]);
        return res.status(200).json({ coop: { ...coop3, members, coopId: coop3.id, coopRole: "member" } });
      }
      const db2 = readLocalDb();
      const coop2 = db2.cooperatives.find((c) => c.joinCode === joinCode);
      if (!coop2) return res.status(404).json({ error: "Cooperative not found" });
      coop2.members = Array.isArray(coop2.members) ? coop2.members : [];
      if (!coop2.members.includes(farmerId)) coop2.members.push(farmerId);
      const farmer2 = db2.farmers.find((f) => f.id === farmerId);
      if (farmer2) {
        farmer2.coopId = coop2.id;
        farmer2.coopRole = "member";
      }
      writeLocalDb(db2);
      return res.status(200).json({ coop: coop2 });
    }
    if (!name || typeof name !== "string") return res.status(400).json({ error: "Cooperative name is required" });
    const descriptionText = typeof description === "string" ? description : "";
    const id = v4();
    const joinCodeValue = joinCode || buildJoinCode();
    const coop = {
      id,
      name,
      description: descriptionText,
      joinCode: joinCodeValue,
      leaderId: farmerId,
      members: [farmerId],
      savingsBalance: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (useSupabase()) {
      await ensureCoreSchema();
      await query(
        `INSERT INTO cooperatives (id, name, description, join_code, leader_id, members, savings_balance, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, name, descriptionText, joinCodeValue, farmerId, JSON.stringify([farmerId]), 0, (/* @__PURE__ */ new Date()).toISOString()]
      );
      await query(`UPDATE farmers SET coop_id = $1, coop_role = 'leader' WHERE id = $2`, [id, farmerId]);
      return res.status(201).json({ coop });
    }
    const db = readLocalDb();
    db.cooperatives.push(coop);
    const farmer = db.farmers.find((f) => f.id === farmerId);
    if (farmer) {
      farmer.coopId = id;
      farmer.coopRole = "leader";
    }
    writeLocalDb(db);
    return res.status(201).json({ coop });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
const cooperatives = withCors(handler);
export {
  cooperatives as default
};
