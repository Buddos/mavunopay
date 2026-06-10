import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';

function buildJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `SELECT id, name, description, join_code AS "joinCode", leader_id AS "leaderId", members, savings_balance AS "savingsBalance", created_at AS "createdAt"
         FROM cooperatives
         WHERE leader_id = $1 OR members::text LIKE $2`,
        [farmerId, `%${farmerId}%`]
      );
      return res.status(200).json({ cooperatives: result.rows });
    }

    const db = readLocalDb();
    const cooperatives = db.cooperatives.filter((coop: any) =>
      coop.leaderId === farmerId || (Array.isArray(coop.members) && coop.members.includes(farmerId))
    );
    return res.status(200).json({ cooperatives });
  }

  if (req.method === 'POST') {
    const { farmerId, action, name, description, joinCode } = req.body;
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

    if (action === 'join') {
      if (!joinCode) return res.status(400).json({ error: 'joinCode is required to join a cooperative' });

      if (useSupabase()) {
        await ensureCoreSchema();
        const coopResult = await query(
          `SELECT id, members FROM cooperatives WHERE join_code = $1 LIMIT 1`,
          [joinCode]
        );
        if (coopResult.rowCount === 0) return res.status(404).json({ error: 'Cooperative not found' });
        const coop = coopResult.rows[0];
        const members = Array.isArray(coop.members) ? [...coop.members] : [];
        if (!members.includes(farmerId)) members.push(farmerId);
        await query(`UPDATE cooperatives SET members = $1 WHERE id = $2`, [members, coop.id]);
        await query(`UPDATE farmers SET coop_id = $1, coop_role = 'member' WHERE id = $2`, [coop.id, farmerId]);
        return res.status(200).json({ coop: { ...coop, members, coopId: coop.id, coopRole: 'member' } });
      }

      const db = readLocalDb();
      const coop = db.cooperatives.find((c: any) => c.joinCode === joinCode);
      if (!coop) return res.status(404).json({ error: 'Cooperative not found' });
      coop.members = Array.isArray(coop.members) ? coop.members : [];
      if (!coop.members.includes(farmerId)) coop.members.push(farmerId);
      const farmer = db.farmers.find((f: any) => f.id === farmerId);
      if (farmer) {
        farmer.coopId = coop.id;
        farmer.coopRole = 'member';
      }
      writeLocalDb(db);
      return res.status(200).json({ coop });
    }

    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Cooperative name is required' });
    const descriptionText = typeof description === 'string' ? description : '';
    const id = uuidv4();
    const joinCodeValue = joinCode || buildJoinCode();
    const coop = {
      id,
      name,
      description: descriptionText,
      joinCode: joinCodeValue,
      leaderId: farmerId,
      members: [farmerId],
      savingsBalance: 0,
      createdAt: new Date().toISOString(),
    };

    if (useSupabase()) {
      await ensureCoreSchema();
      await query(
        `INSERT INTO cooperatives (id, name, description, join_code, leader_id, members, savings_balance, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, name, descriptionText, joinCodeValue, farmerId, JSON.stringify([farmerId]), 0, new Date().toISOString()]
      );
      await query(`UPDATE farmers SET coop_id = $1, coop_role = 'leader' WHERE id = $2`, [id, farmerId]);
      return res.status(201).json({ coop });
    }

    const db = readLocalDb();
    db.cooperatives.push(coop);
    const farmer = db.farmers.find((f: any) => f.id === farmerId);
    if (farmer) {
      farmer.coopId = id;
      farmer.coopRole = 'leader';
    }
    writeLocalDb(db);
    return res.status(201).json({ coop });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
