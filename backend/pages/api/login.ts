import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { query, useSupabase } from '../../lib/db';

const DB = path.join(process.cwd(), 'data', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Identifier is required' });
  }

  let farmer: any = null;

  if (useSupabase()) {
    const whereClause = identifier.includes('+')
      ? 'phone = $1'
      : 'id = $1';
    const result = await query(`SELECT id, phone, name, stellar_public_key, created_at FROM farmers WHERE ${whereClause} LIMIT 1`, [identifier]);
    farmer = result.rows?.[0] ?? null;
  } else {
    const db = readDB();
    farmer = db.farmers.find((f: any) => f.id === identifier || f.phone === identifier) || null;
  }

  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }

  return res.status(200).json({ farmer });
}

export default withCors(handler);
