import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const useSupabaseDb = Boolean(connectionString);

const pool = useSupabaseDb
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null;

export function useSupabase() {
  return useSupabaseDb;
}

export async function query<T = any>(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }
  const result = await pool.query<T>(text, params);
  return result;
}

export async function closePool() {
  if (!pool) return;
  await pool.end();
}
