import { w as withCors } from "./cors-BIye2o2q.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
import "fs";
import "path";
import "node:fs";
import "node:path";
import "node:dns";
import "../_commonjsHelpers-CCIqAdii.mjs";
import "events";
import "util/types";
import "util";
import "crypto";
import "dns";
import "net";
import "tls";
import "stream";
import "string_decoder";
async function handler(req, res) {
  if (req.method === "GET") {
    const farmerId = Array.isArray(req.query.farmerId) ? req.query.farmerId[0] : req.query.farmerId;
    if (!farmerId) return res.status(400).json({ error: "farmerId is required" });
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
    const notifications2 = db.notifications.filter((notification) => notification.farmerId === farmerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.status(200).json({ notifications: notifications2 });
  }
  if (req.method === "POST") {
    const { id, action } = req.body;
    if (!id || action !== "markRead") return res.status(400).json({ error: "id and action=markRead are required" });
    if (useSupabase()) {
      await ensureCoreSchema();
      await query(`UPDATE notifications SET read = true WHERE id = $1`, [id]);
      return res.status(200).json({ success: true });
    }
    const db = readLocalDb();
    const notification = db.notifications.find((n) => n.id === id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    notification.read = true;
    writeLocalDb(db);
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
const notifications = withCors(handler);
export {
  notifications as default
};
