#!/usr/bin/env node
/**
 * Test Supabase/Postgres connectivity and create a probe table.
 * Usage: DATABASE_URL="postgresql://..." node scripts/test-supabase-connection.mjs
 * Or create backend/.env with DATABASE_URL=...
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "backend", "package.json"));
const pg = require("pg");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, "backend", ".env"));
loadEnvFile(path.join(root, "backend", ".env.local"));
loadEnvFile(path.join(root, ".env"));

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
  console.error(
    "[supabase-test] DATABASE_URL is not set. Create backend/.env with your Supabase connection string.",
  );
  console.error(
    "[supabase-test] Supabase Dashboard -> Project Settings -> Database -> Connection string (URI)",
  );
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const TABLE = "mavunopay_connection_test";

async function main() {
  console.log("[supabase-test] Connecting to Postgres...");

  const version = await pool.query("SELECT version() AS version, now() AS server_time");
  console.log("[supabase-test] Connected:", version.rows[0].server_time);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      message text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log(`[supabase-test] Table ensured: ${TABLE}`);

  const insert = await pool.query(
    `INSERT INTO ${TABLE} (message) VALUES ($1) RETURNING id, message, created_at`,
    [`MavunoPay connection OK at ${new Date().toISOString()}`],
  );
  console.log("[supabase-test] Inserted row:", insert.rows[0]);

  const count = await pool.query(`SELECT COUNT(*)::int AS count FROM ${TABLE}`);
  console.log(`[supabase-test] Row count in ${TABLE}:`, count.rows[0].count);

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
    LIMIT 20
  `);
  console.log(
    "[supabase-test] Public tables (first 20):",
    tables.rows.map((r) => r.table_name).join(", ") || "(none)",
  );

  console.log("\n[supabase-test] SUCCESS — Supabase database is reachable.");
}

main()
  .catch((error) => {
    console.error("\n[supabase-test] FAILED:", error.message);
    if (error.code) console.error("[supabase-test] Code:", error.code);
    if (error.code === "ENETUNREACH" || error.message.includes("ENOTFOUND db.")) {
      console.error(
        "[supabase-test] Tip: use the Session pooler URI from Supabase (aws-1-eu-central-1.pooler.supabase.com), not the direct db.* host.",
      );
    }
    if (error.message.includes("password authentication failed")) {
      console.error(
        "[supabase-test] Tip: reset the database password in Supabase Dashboard -> Project Settings -> Database, then update backend/.env",
      );
    }
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
