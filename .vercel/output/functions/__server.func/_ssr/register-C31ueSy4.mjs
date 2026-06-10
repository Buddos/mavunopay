import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { g as generateKeypair, f as fundAccountIfNeeded, c as createTrustline, m as monitorMinimumBalance } from "./stellar-c7apZeDO.mjs";
import { w as withCors } from "./cors-BIye2o2q.mjs";
import { u as useSupabase, e as ensureFarmersSchema, q as query, i as insertAllocationRules } from "./db-C9kVyrmy.mjs";
import { h as hashPin } from "./auth-Cnn8fTEl.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
import "../_libs/lodash.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/debug.mjs";
import "../_commonjsHelpers-CCIqAdii.mjs";
import "crypto";
import "tslib";
import "buffer";
import "../_libs/es-errors.mjs";
import "../_libs/hasown.mjs";
import "fs";
import "path";
import "os";
import "http";
import "https";
import "url";
import "stream";
import "assert";
import "zlib";
import "events";
import "util";
import "net";
import "tls";
import "http2";
import "node:fs";
import "node:path";
import "node:dns";
import "util/types";
import "dns";
import "string_decoder";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "../_libs/has-flag.mjs";
const defaultAllocationRules = [
  { key: "inputs", pct: 20 },
  { key: "emergency", pct: 10 },
  { key: "education", pct: 10 },
  { key: "disposable", pct: 60 }
];
async function handler(req, res) {
  if (req.method === "POST") {
    const { phone, name, nationalId, pin } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    if (!pin || typeof pin !== "string" || pin.trim().length !== 4) {
      return res.status(400).json({ error: "PIN must be exactly 4 digits" });
    }
    const farmerId = v4();
    const keys = generateKeypair();
    const pinHash = hashPin(pin.trim());
    const farmer = {
      id: farmerId,
      phone,
      name: name || null,
      nationalId: nationalId || null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      stellarPublicKey: keys.publicKey,
      allocationRules: defaultAllocationRules,
      creditScore: 560,
      creditTier: "Bronze",
      coopId: null,
      coopRole: "member"
    };
    let fund = { funded: false, publicKey: keys.publicKey };
    if (useSupabase()) {
      await ensureFarmersSchema();
      await query(
        `INSERT INTO farmers (id, phone, name, national_id, pin, stellar_public_key, created_at, credit_score, credit_tier, coop_id, coop_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [farmerId, phone, name || null, nationalId || null, pinHash, keys.publicKey, farmer.createdAt, 560, "Bronze", null, "member"]
      );
      await insertAllocationRules(farmerId, defaultAllocationRules);
    } else {
      const db = readLocalDb();
      db.farmers.push({ ...farmer, pin: pinHash, nationalId: nationalId || null });
      writeLocalDb(db);
    }
    fund = await fundAccountIfNeeded(keys.publicKey, farmerId, keys.secret);
    if (process.env.USDC_ISSUER && process.env.USDC_CODE) {
      await createTrustline(farmerId, process.env.USDC_CODE, process.env.USDC_ISSUER);
    }
    const threshold = process.env.MINIMUM_BALANCE_THRESHOLD_XLM ? Number(process.env.MINIMUM_BALANCE_THRESHOLD_XLM) : 1.5;
    const balanceStatus = await monitorMinimumBalance(keys.publicKey, threshold);
    return res.status(201).json({ farmer, funded: fund, balanceStatus });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
const register = withCors(handler);
export {
  register as default
};
