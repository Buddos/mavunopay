import { w as withCors } from "./cors-BIye2o2q.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
import { r as readLocalDb } from "./local-db-C03tS4Sk.mjs";
import "fs";
import "path";
import "node:fs";
import "node:path";
import "node:dns";
import "../_commonjsHelpers-CCIqAdii.mjs";
import "events";
import "util/types";
import "util";
import "crypto";
import "dns";
import "net";
import "tls";
import "stream";
import "string_decoder";
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
  if (!farmerId) {
    return res.status(400).json({ error: "farmerId is required" });
  }
  if (useSupabase()) {
    await ensureCoreSchema();
    const result = await query(
      `SELECT id, farmer_id AS "farmerId", amount, memo, asset_code AS "assetCode", asset_issuer AS "assetIssuer", group_payment AS "groupPayment", allocations, stellar_tx_hash AS "stellarTxHash", created_at AS "createdAt"
       FROM transactions WHERE farmer_id = $1 ORDER BY created_at DESC`,
      [farmerId]
    );
    return res.status(200).json({ transactions: result.rows });
  }
  const db = readLocalDb();
  const transactions2 = (db.transactions || []).filter((t) => t.farmerId === farmerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.status(200).json({ transactions: transactions2 });
}
const transactions = withCors(handler);
export {
  transactions as default
};
