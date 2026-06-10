import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `SELECT id, farmer_id AS "farmerId", name, description, target_amount AS "targetAmount", balance, currency, target_date AS "targetDate", locked, unlock_date AS "unlockDate", created_at AS "createdAt"
         FROM goals WHERE farmer_id = $1 ORDER BY created_at DESC`,
        [farmerId]
      );
      return res.status(200).json({ goals: result.rows });
    }

    const db = readLocalDb();
    const goals = db.goals.filter((g: any) => g.farmerId === farmerId);
    return res.status(200).json({ goals });
  }

  if (req.method === 'POST') {
    const { farmerId, name, description, targetAmount, currency = 'KES', targetDate, locked = false, unlockDate } = req.body;
    if (!farmerId || !name || !targetAmount) return res.status(400).json({ error: 'farmerId, name, targetAmount required' });

    const goal = {
      id: uuidv4(),
      farmerId,
      name,
      description: description || null,
      targetAmount,
      balance: 0,
      currency,
      targetDate: targetDate || null,
      locked: Boolean(locked),
      unlockDate: unlockDate || null,
      createdAt: new Date().toISOString(),
    };

    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `INSERT INTO goals (id, farmer_id, name, description, target_amount, balance, currency, target_date, locked, unlock_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, farmer_id AS "farmerId", name, description, target_amount AS "targetAmount", balance, currency, target_date AS "targetDate", locked, unlock_date AS "unlockDate", created_at AS "createdAt"`,
        [goal.id, farmerId, name, goal.description, targetAmount, 0, currency, goal.targetDate, goal.locked, goal.unlockDate, goal.createdAt]
      );
      return res.status(201).json({ goal: result.rows[0] });
    }

    const db = readLocalDb();
    db.goals.push(goal);
    writeLocalDb(db);

    return res.status(201).json({ goal });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
