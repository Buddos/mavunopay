import { w as withCors } from "./cors-BIye2o2q.mjs";
import { u as useSupabase, e as ensureFarmersSchema, q as query } from "./db-C9kVyrmy.mjs";
import { h as hashPin } from "./auth-Cnn8fTEl.mjs";
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { phone, pin } = req.body;
  if (!phone || !pin) {
    return res.status(400).json({ error: "Phone and PIN are required" });
  }
  if (typeof pin !== "string" || pin.trim().length !== 4) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits" });
  }
  const hashedPin = hashPin(pin.trim());
  let farmer = null;
  if (useSupabase()) {
    await ensureFarmersSchema();
    const result = await query(`SELECT id, phone, name, stellar_public_key, created_at, pin FROM farmers WHERE phone = $1 LIMIT 1`, [phone]);
    farmer = result.rows?.[0] ?? null;
    if (!farmer || farmer.pin !== hashedPin) {
      return res.status(401).json({ error: "Invalid phone or PIN" });
    }
    delete farmer.pin;
  } else {
    const db = readLocalDb();
    farmer = db.farmers.find((f) => f.phone === phone) || null;
    if (!farmer || farmer.pin !== hashedPin) {
      return res.status(401).json({ error: "Invalid phone or PIN" });
    }
  }
  if (!farmer) {
    return res.status(404).json({ error: "Farmer not found" });
  }
  return res.status(200).json({ farmer });
}
const login = withCors(handler);
export {
  login as default
};
