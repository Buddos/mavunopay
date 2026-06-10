import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';
import { query, useSupabase, ensureCoreSchema } from '../../lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' });

    if (useSupabase()) {
      await ensureCoreSchema();
      const result = await query(
        `SELECT id, farmer_id AS "farmerId", type, title, message, read, created_at AS "createdAt"
         FROM notifications WHERE farmer_id = $1 ORDER BY created_at DESC`,
        [farmerId]
      );
      return res.status(200).json({ notifications: result.rows });
    }

    const db = readLocalDb();
    const notifications = db.notifications
      .filter((notification: any) => notification.farmerId === farmerId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.status(200).json({ notifications });
  }

  if (req.method === 'POST') {
    const { id, action } = req.body;
    if (!id || action !== 'markRead') return res.status(400).json({ error: 'id and action=markRead are required' });

    if (useSupabase()) {
      await ensureCoreSchema();
      await query(`UPDATE notifications SET read = true WHERE id = $1`, [id]);
      return res.status(200).json({ success: true });
    }

    const db = readLocalDb();
    const notification = db.notifications.find((n: any) => n.id === id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    notification.read = true;
    writeLocalDb(db);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(handler);
