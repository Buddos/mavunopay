"use strict";exports.id=150,exports.ids=[150],exports.modules={4150:(e,a,t)=>{t.a(e,async(e,r)=>{try{t.d(a,{$4:()=>useSupabase,IO:()=>query,PM:()=>ensureCoreSchema,ln:()=>ensureFarmersSchema,w4:()=>ensureGoalsSchema});var i=t(8678),s=e([i]);i=(s.then?(await s)():s)[0];let T=process.env.DATABASE_URL||"",n=!!T,L=n?new i.Pool({connectionString:T,ssl:{rejectUnauthorized:!1}}):null;function useSupabase(){return n}async function query(e,a){if(!L)throw Error("DATABASE_URL is not configured");let t=await L.query(e,a);return t}async function ensureFarmersSchema(){L&&(await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS pin text;"),await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS national_id text;"),await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS credit_score integer DEFAULT 560;"),await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS credit_tier text DEFAULT 'Bronze';"),await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS coop_id text;"),await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS coop_role text DEFAULT 'member';"),await query("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb;"))}async function ensureGoalsSchema(){L&&(await query("ALTER TABLE goals ADD COLUMN IF NOT EXISTS description text;"),await query("ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date timestamptz;"),await query("ALTER TABLE goals ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES';"),await query("ALTER TABLE goals ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;"),await query("ALTER TABLE goals ADD COLUMN IF NOT EXISTS unlock_date timestamptz;"))}async function ensureTransactionsSchema(){L&&(await query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS asset_code text;"),await query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS asset_issuer text;"),await query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS group_payment boolean DEFAULT false;"),await query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS allocations jsonb;"))}async function ensureWithdrawalSchema(){L&&(await query(`
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
  `),await query("CREATE INDEX IF NOT EXISTS idx_withdrawals_farmer_id ON withdrawal_requests(farmer_id);"))}async function ensureLoansSchema(){L&&(await query(`
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
  `),await query("CREATE INDEX IF NOT EXISTS idx_loans_farmer_id ON loans(farmer_id);"))}async function ensureNotificationsSchema(){L&&(await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY,
      farmer_id text NOT NULL,
      type text NOT NULL,
      title text NOT NULL,
      message text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `),await query("CREATE INDEX IF NOT EXISTS idx_notifications_farmer_id ON notifications(farmer_id);"))}async function ensureCooperativesSchema(){L&&(await query(`
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
  `),await query("CREATE INDEX IF NOT EXISTS idx_coops_leader_id ON cooperatives(leader_id);"))}async function ensureCoreSchema(){L&&(await ensureFarmersSchema(),await ensureGoalsSchema(),await ensureTransactionsSchema(),await ensureWithdrawalSchema(),await ensureLoansSchema(),await ensureNotificationsSchema(),await ensureCooperativesSchema())}r()}catch(e){r(e)}})}};