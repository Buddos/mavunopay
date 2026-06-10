import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { query, useSupabase, ensureFarmersSchema } from '../../lib/db';
import { hashPin } from '../../lib/auth';

const DB = path.join(process.cwd(), 'data', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, pin } = req.body;
  if (!phone || !pin) {
    return res.status(400).json({ error: 'Phone and PIN are required' });
  }
  if (typeof pin !== 'string' || pin.trim().length !== 4) {
    return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
  }

  const hashedPin = hashPin(pin.trim());
  let farmer: any = null;

  if (useSupabase()) {
    await ensureFarmersSchema();
    const result = await query(`SELECT id, phone, name, stellar_public_key, created_at, pin FROM farmers WHERE phone = $1 LIMIT 1`, [phone]);
    farmer = result.rows?.[0] ?? null;
    if (!farmer || farmer.pin !== hashedPin) {
      return res.status(401).json({ error: 'Invalid phone or PIN' });
    }
    delete farmer.pin;
  } else {
    const db = readDB();
    farmer = db.farmers.find((f: any) => f.phone === phone) || null;
    if (!farmer || farmer.pin !== hashedPin) {
      return res.status(401).json({ error: 'Invalid phone or PIN' });
    }
  }

  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }

  return res.status(200).json({ farmer });
}

export default withCors(handler);
