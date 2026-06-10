import fs from "fs";
import path from "path";
import { u as useSupabase, q as query, g as getDataDir } from "./db-C9kVyrmy.mjs";
import { v as v4 } from "./wrapper-C1_KymC2.mjs";
function getOtpDbPath() {
  return path.join(getDataDir(), "otps.json");
}
function normalizePhone(phone) {
  return phone.trim();
}
function generateOtpCode() {
  return String(Math.floor(1e3 + Math.random() * 9e3));
}
function isValidOtpCode(code) {
  return /^\d{4}$/.test(code.trim());
}
function ensureOtpFile() {
  const otpDb = getOtpDbPath();
  const otpDir = path.dirname(otpDb);
  if (!fs.existsSync(otpDir)) {
    fs.mkdirSync(otpDir, { recursive: true });
  }
  if (!fs.existsSync(otpDb)) {
    fs.writeFileSync(otpDb, JSON.stringify({ otps: [] }, null, 2));
  }
}
function readLocalOtps() {
  ensureOtpFile();
  return JSON.parse(fs.readFileSync(getOtpDbPath(), "utf-8"));
}
function writeLocalOtps(data) {
  fs.writeFileSync(getOtpDbPath(), JSON.stringify(data, null, 2));
}
async function ensureOtpSchema() {
  if (!useSupabase()) return;
  await query(`
    CREATE TABLE IF NOT EXISTS otps (
      id uuid PRIMARY KEY,
      phone text NOT NULL,
      code text NOT NULL,
      expires_at timestamptz NOT NULL,
      used boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);`);
}
async function createOtp(phone, code, minutes = 10) {
  const normalizedPhone = normalizePhone(phone);
  const expiresAt = new Date(Date.now() + minutes * 60 * 1e3).toISOString();
  if (useSupabase()) {
    await ensureOtpSchema();
    await query(`UPDATE otps SET used = true WHERE phone = $1 AND used = false`, [normalizedPhone]);
    await query(
      `INSERT INTO otps (id, phone, code, expires_at, used, created_at)
       VALUES ($1, $2, $3, $4, false, now())`,
      [v4(), normalizedPhone, code, expiresAt]
    );
    return;
  }
  const store = readLocalOtps();
  store.otps = store.otps.filter((row) => row.phone !== normalizedPhone || row.expiresAt > (/* @__PURE__ */ new Date()).toISOString());
  store.otps.push({
    id: v4(),
    phone: normalizedPhone,
    code,
    expiresAt,
    used: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  writeLocalOtps(store);
}
async function verifyOtp(phone, code) {
  const normalizedPhone = normalizePhone(phone);
  if (useSupabase()) {
    await ensureOtpSchema();
    const result = await query(
      `SELECT id, code, expires_at, used FROM otps WHERE phone = $1 AND used = false AND expires_at > now() ORDER BY created_at DESC LIMIT 1`,
      [normalizedPhone]
    );
    const otpRow2 = result.rows?.[0];
    if (!otpRow2) {
      return { valid: false, reason: "No active OTP found or it has expired" };
    }
    if (otpRow2.code !== code.trim()) {
      return { valid: false, reason: "Invalid OTP" };
    }
    await query(`UPDATE otps SET used = true WHERE id = $1`, [otpRow2.id]);
    return { valid: true };
  }
  const store = readLocalOtps();
  const otpRow = store.otps.filter((row) => !row.used && row.phone === normalizedPhone && row.expiresAt > (/* @__PURE__ */ new Date()).toISOString()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  if (!otpRow) {
    return { valid: false, reason: "No active OTP found or it has expired" };
  }
  if (otpRow.code !== code) {
    return { valid: false, reason: "Invalid OTP" };
  }
  otpRow.used = true;
  writeLocalOtps(store);
  return { valid: true };
}
export {
  createOtp as c,
  generateOtpCode as g,
  isValidOtpCode as i,
  verifyOtp as v
};
