import { w as withCors } from "./cors-BIye2o2q.mjs";
import { u as useSupabase, p as pingDatabase, g as getDataDir } from "./db-C9kVyrmy.mjs";
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
  const storage = useSupabase() ? "postgres" : "local-file";
  let database = "not_configured";
  if (useSupabase()) {
    try {
      await pingDatabase();
      database = "connected";
    } catch {
      database = "unreachable";
    }
  }
  const ok = database !== "unreachable";
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    service: "mavunopay-backend",
    environment: "production",
    storage,
    database,
    dataDir: storage === "local-file" ? getDataDir() : void 0,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
const health = withCors(handler);
export {
  health as default
};
