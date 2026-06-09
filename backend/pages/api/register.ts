import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateKeypair, fundAccountIfNeeded, createTrustline } from '../../lib/stellar';
import { withCors } from '../../lib/cors';
import { query, useSupabase } from '../../lib/db';

const DB = path.join(process.cwd(), 'data', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function writeDB(data: any) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

const defaultAllocationRules = [
  { key: 'inputs', pct: 20 },
  { key: 'emergency', pct: 10 },
  { key: 'education', pct: 10 },
  { key: 'disposable', pct: 60 },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const farmerId = uuidv4();
    const keys = generateKeypair();
    const farmer = {
      id: farmerId,
      phone,
      name: name || null,
      createdAt: new Date().toISOString(),
      stellarPublicKey: keys.publicKey,
      allocationRules: defaultAllocationRules,
    };

    let fund: any = { funded: false, publicKey: keys.publicKey };

    if (useSupabase()) {
      await query(
        `INSERT INTO farmers (id, phone, name, stellar_public_key, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [farmerId, phone, name || null, keys.publicKey, farmer.createdAt]
      );

      for (const rule of defaultAllocationRules) {
        await query(
          `INSERT INTO allocation_rules (farmer_id, key, pct) VALUES ($1, $2, $3)`,
          [farmerId, rule.key, rule.pct]
        );
      }
    } else {
      const db = readDB();
      db.farmers.push(farmer);
      writeDB(db);
    }

    fund = await fundAccountIfNeeded(keys.publicKey, farmerId, keys.secret);

    if (process.env.USDC_ISSUER && process.env.USDC_CODE) {
      await createTrustline(farmerId, process.env.USDC_CODE, process.env.USDC_ISSUER);
    }

    return res.status(201).json({ farmer, funded: fund });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
