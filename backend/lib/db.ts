import './load-env';
import dns from 'node:dns';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

dns.setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL || '';
const useSupabaseDb = Boolean(connectionString);

const pool = useSupabaseDb
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15_000,
      max: 5,
    })
  : null;

export function useSupabase() {
  return useSupabaseDb;
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }

  try {
    const result: QueryResult<T> = await pool.query<T>(text, params);
    return result;
  } catch (error: any) {
    if (error?.code === 'ENOTFOUND' || error?.code === 'ENETUNREACH') {
      throw new Error(
        `Database host unreachable (${error.code}). Restart the backend after updating backend/.env.`,
      );
    }
    throw error;
  }
}

export async function pingDatabase() {
  if (!pool) return { ok: false as const, reason: 'not_configured' };
  await pool.query('SELECT 1 AS ok');
  return { ok: true as const };
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function insertAllocationRules(
  farmerId: string,
  rules: { key: string; pct: number }[],
) {
  const total = rules.reduce((sum, rule) => sum + rule.pct, 0);
  if (total !== 100) {
    throw new Error('Allocation rules must sum to 100');
  }

  await withTransaction(async (client) => {
    await client.query('ALTER TABLE allocation_rules DISABLE TRIGGER trg_check_allocation_sum');
    try {
      for (const rule of rules) {
        await client.query(`INSERT INTO allocation_rules (farmer_id, key, pct) VALUES ($1, $2, $3)`, [
          farmerId,
          rule.key,
          rule.pct,
        ]);
      }
    } finally {
      await client.query('ALTER TABLE allocation_rules ENABLE TRIGGER trg_check_allocation_sum');
    }
  });
}

export async function ensureFarmersSchema() {
  if (!pool) return;
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS pin text;`);
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS national_id text;`);
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS credit_score integer DEFAULT 560;`);
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS credit_tier text DEFAULT 'Bronze';`);
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS coop_id text;`);
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS coop_role text DEFAULT 'member';`);
  await query(`ALTER TABLE farmers ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb;`);
}

export async function ensureGoalsSchema() {
  if (!pool) return;
  await query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS description text;`);
  await query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date timestamptz;`);
  await query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES';`);
  await query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;`);
  await query(`ALTER TABLE goals ADD COLUMN IF NOT EXISTS unlock_date timestamptz;`);
}

export async function ensureTransactionsSchema() {
  if (!pool) return;
  await query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS asset_code text;`);
  await query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS asset_issuer text;`);
  await query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS group_payment boolean DEFAULT false;`);
  await query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS allocations jsonb;`);
}

export async function ensureWithdrawalSchema() {
  if (!pool) return;
  await query(`
    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id uuid PRIMARY KEY,
      farmer_id text NOT NULL,
      goal_id text,
      amount numeric NOT NULL,
      currency text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      type text NOT NULL DEFAULT 'standard',
      memo text,
      requested_at timestamptz NOT NULL DEFAULT now(),
      processed_at timestamptz
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_farmer_id ON withdrawal_requests(farmer_id);`);
}

export async function ensureLoansSchema() {
  if (!pool) return;
  await query(`
    CREATE TABLE IF NOT EXISTS loans (
      id uuid PRIMARY KEY,
      farmer_id text NOT NULL,
      amount numeric NOT NULL,
      currency text NOT NULL,
      term_months integer NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      requested_at timestamptz NOT NULL DEFAULT now(),
      approved_at timestamptz,
      due_date timestamptz,
      repaid_amount numeric DEFAULT 0
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_loans_farmer_id ON loans(farmer_id);`);
}

export async function ensureNotificationsSchema() {
  if (!pool) return;
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY,
      farmer_id text NOT NULL,
      type text NOT NULL,
      title text NOT NULL,
      message text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_notifications_farmer_id ON notifications(farmer_id);`);
}

export async function ensureCooperativesSchema() {
  if (!pool) return;
  await query(`
    CREATE TABLE IF NOT EXISTS cooperatives (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      description text,
      join_code text UNIQUE,
      leader_id text NOT NULL,
      members jsonb NOT NULL DEFAULT '[]'::jsonb,
      savings_balance numeric DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_coops_leader_id ON cooperatives(leader_id);`);
}

export async function ensureCoreSchema() {
  if (!pool) return;
  await ensureFarmersSchema();
  await ensureGoalsSchema();
  await ensureTransactionsSchema();
  await ensureWithdrawalSchema();
  await ensureLoansSchema();
  await ensureNotificationsSchema();
  await ensureCooperativesSchema();
}

export async function closePool() {
  if (!pool) return;
  await pool.end();
}
