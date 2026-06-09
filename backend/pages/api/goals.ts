import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { query, useSupabase } from '../../lib/db';

const DB = path.join(process.cwd(), 'data', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function writeDB(data: any) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

    if (useSupabase()) {
      const result = await query(
        `SELECT id, farmer_id AS "farmerId", name, target_amount AS "targetAmount", balance, currency, locked, unlock_date AS "unlockDate", created_at AS "createdAt"
         FROM goals WHERE farmer_id = $1 ORDER BY created_at DESC`,
        [farmerId]
      );
      return res.status(200).json({ goals: result.rows });
    }

    const db = readDB();
    const goals = db.goals.filter((g: any) => g.farmerId === farmerId);
    return res.status(200).json({ goals });
  }

  if (req.method === 'POST') {
    const { farmerId, name, targetAmount } = req.body;
    if (!farmerId || !name || !targetAmount) return res.status(400).json({ error: 'farmerId, name, targetAmount required' });

    const goal = {
      id: uuidv4(),
      farmerId,
      name,
      targetAmount,
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    if (useSupabase()) {
      const result = await query(
        `INSERT INTO goals (id, farmer_id, name, target_amount, balance, currency, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, farmer_id AS "farmerId", name, target_amount AS "targetAmount", balance, currency, locked, unlock_date AS "unlockDate", created_at AS "createdAt"`,
        [goal.id, farmerId, name, targetAmount, 0, 'KES', goal.createdAt]
      );
      return res.status(201).json({ goal: result.rows[0] });
    }

    const db = readDB();
    db.goals.push(goal);
    writeDB(db);

    return res.status(201).json({ goal });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
