import fs from 'fs';
import path from 'path';
import { query, useSupabase } from './db';
import { v4 as uuidv4 } from 'uuid';

const OTP_DIR = path.join(process.cwd(), 'data');
const OTP_DB = path.join(OTP_DIR, 'otps.json');

export interface OtpRecord {
  id: string;
  phone: string;
  code: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

type LocalOtpStore = { otps: OtpRecord[] };

function normalizePhone(phone: string) {
  return phone.trim();
}

function ensureOtpFile() {
  if (!fs.existsSync(OTP_DIR)) {
    fs.mkdirSync(OTP_DIR, { recursive: true });
  }
  if (!fs.existsSync(OTP_DB)) {
    fs.writeFileSync(OTP_DB, JSON.stringify({ otps: [] }, null, 2));
  }
}

function readLocalOtps(): LocalOtpStore {
  ensureOtpFile();
  return JSON.parse(fs.readFileSync(OTP_DB, 'utf-8')) as LocalOtpStore;
}

function writeLocalOtps(data: LocalOtpStore) {
  fs.writeFileSync(OTP_DB, JSON.stringify(data, null, 2));
}

export async function ensureOtpSchema() {
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

export async function createOtp(phone: string, code: string, minutes = 10) {
  const normalizedPhone = normalizePhone(phone);
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

  if (useSupabase()) {
    await ensureOtpSchema();
    await query(
      `INSERT INTO otps (id, phone, code, expires_at, used, created_at)
       VALUES ($1, $2, $3, $4, false, now())`,
      [uuidv4(), normalizedPhone, code, expiresAt]
    );
    return;
  }

  const store = readLocalOtps();
  store.otps = store.otps.filter((row) => row.phone !== normalizedPhone || row.expiresAt > new Date().toISOString());
  store.otps.push({
    id: uuidv4(),
    phone: normalizedPhone,
    code,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString(),
  });
  writeLocalOtps(store);
}

export async function verifyOtp(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);

  if (useSupabase()) {
    await ensureOtpSchema();
    const result = await query(
      `SELECT id, code, expires_at, used FROM otps WHERE phone = $1 AND used = false AND expires_at > now() ORDER BY created_at DESC LIMIT 1`,
      [normalizedPhone]
    );
    const otpRow = result.rows?.[0] as OtpRecord | undefined;
    if (!otpRow) {
      return { valid: false, reason: 'No active OTP found or it has expired' };
    }
    if (otpRow.code !== code) {
      return { valid: false, reason: 'Invalid OTP' };
    }
    await query(`UPDATE otps SET used = true WHERE id = $1`, [otpRow.id]);
    return { valid: true };
  }

  const store = readLocalOtps();
  const otpRow = store.otps
    .filter((row) => !row.used && row.phone === normalizedPhone && row.expiresAt > new Date().toISOString())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!otpRow) {
    return { valid: false, reason: 'No active OTP found or it has expired' };
  }

  if (otpRow.code !== code) {
    return { valid: false, reason: 'Invalid OTP' };
  }

  otpRow.used = true;
  writeLocalOtps(store);
  return { valid: true };
}
