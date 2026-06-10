import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateKeypair, fundAccountIfNeeded, createTrustline, monitorMinimumBalance } from '../../lib/stellar';
import { withCors } from '../../lib/cors';
import { query, useSupabase, ensureFarmersSchema } from '../../lib/db';
import { hashPin } from '../../lib/auth';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';

const defaultAllocationRules = [
  { key: 'inputs', pct: 20 },
  { key: 'emergency', pct: 10 },
  { key: 'education', pct: 10 },
  { key: 'disposable', pct: 60 },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phone, name, nationalId, pin } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });
    if (!pin || typeof pin !== 'string' || pin.trim().length !== 4) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    const farmerId = uuidv4();
    const keys = generateKeypair();
    const pinHash = hashPin(pin.trim());
    const farmer = {
      id: farmerId,
      phone,
      name: name || null,
      nationalId: nationalId || null,
      createdAt: new Date().toISOString(),
      stellarPublicKey: keys.publicKey,
      allocationRules: defaultAllocationRules,
      creditScore: 560,
      creditTier: 'Bronze',
      coopId: null,
      coopRole: 'member',
    };

    let fund: any = { funded: false, publicKey: keys.publicKey };

    if (useSupabase()) {
      await ensureFarmersSchema();
      await query(
        `INSERT INTO farmers (id, phone, name, national_id, pin, stellar_public_key, created_at, credit_score, credit_tier, coop_id, coop_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [farmerId, phone, name || null, nationalId || null, pinHash, keys.publicKey, farmer.createdAt, 560, 'Bronze', null, 'member']
      );

      for (const rule of defaultAllocationRules) {
        await query(
          `INSERT INTO allocation_rules (farmer_id, key, pct) VALUES ($1, $2, $3)`,
          [farmerId, rule.key, rule.pct]
        );
      }
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

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
