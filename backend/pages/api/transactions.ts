import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';
import { readLocalDb } from '../../lib/local-db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
  if (!farmerId) {
    return res.status(400).json({ error: 'farmerId is required' });
  }

  if (useSupabase()) {
    await ensureCoreSchema();
    const result = await query(
      `SELECT id, farmer_id AS "farmerId", amount, memo, asset_code AS "assetCode", asset_issuer AS "assetIssuer", group_payment AS "groupPayment", allocations, stellar_tx_hash AS "stellarTxHash", created_at AS "createdAt"
       FROM transactions WHERE farmer_id = $1 ORDER BY created_at DESC`,
      [farmerId]
    );
    return res.status(200).json({ transactions: result.rows });
  }

  const db = readLocalDb();
  const transactions = (db.transactions || [])
    .filter((t: any) => t.farmerId === farmerId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.status(200).json({ transactions });
}

export default withCors(handler);
