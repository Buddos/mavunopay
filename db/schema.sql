-- MavunoPay Postgres schema for Supabase
-- Run in Supabase SQL Editor or via psql against the Supabase DB

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Farmers / Users
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid NULL, -- optional: map to Supabase Auth user id
  phone text UNIQUE NOT NULL,
  name text,
  stellar_public_key text UNIQUE,
  stellar_secret text, -- PROTOTYPE ONLY: DO NOT STORE SECRETS IN PLAIN TEXT IN PRODUCTION
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Allocation rules per-farmer (percentages must sum to 100)
CREATE TABLE IF NOT EXISTS allocation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  key text NOT NULL,
  pct integer NOT NULL CHECK (pct >= 0 AND pct <= 100),
  created_at timestamptz DEFAULT now()
);

-- Trigger function to enforce that allocation rules for a farmer sum to 100
CREATE OR REPLACE FUNCTION fn_check_allocation_sum() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  total integer;
BEGIN
  SELECT COALESCE(SUM(pct), 0) INTO total FROM allocation_rules WHERE farmer_id = NEW.farmer_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  total := total + NEW.pct;
  IF total <> 100 THEN
    RAISE EXCEPTION 'Allocation percentages for farmer % must sum to 100 (current total: %)', NEW.farmer_id, total;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_allocation_sum
BEFORE INSERT OR UPDATE ON allocation_rules
FOR EACH ROW EXECUTE FUNCTION fn_check_allocation_sum();

-- Savings goals
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric(18,2) NOT NULL DEFAULT 0,
  balance numeric(18,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'KES',
  locked boolean DEFAULT false,
  unlock_date timestamptz NULL,
  created_at timestamptz DEFAULT now()
);

-- Transactions (incoming payments and allocations)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE SET NULL,
  amount numeric(18,2) NOT NULL,
  currency text DEFAULT 'XLM',
  memo text NULL,
  allocations jsonb NULL, -- [{key, pct, amount, goal_id}]
  stellar_tx_hash text NULL,
  created_at timestamptz DEFAULT now()
);

-- Cooperatives / groups
CREATE TABLE IF NOT EXISTS cooperatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_id uuid REFERENCES farmers(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cooperative_members (
  cooperative_id uuid REFERENCES cooperatives(id) ON DELETE CASCADE,
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (cooperative_id, farmer_id)
);

-- Trustlines held by farmer wallets
CREATE TABLE IF NOT EXISTS trustlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  asset_code text NOT NULL,
  issuer text NOT NULL,
  status text DEFAULT 'pending', -- pending | active | failed
  created_at timestamptz DEFAULT now()
);

-- Soroban / contract registry (for bookkeeping)
CREATE TABLE IF NOT EXISTS soroban_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contract_id text NOT NULL UNIQUE,
  deployed_by uuid REFERENCES farmers(id) ON DELETE SET NULL,
  network text DEFAULT 'TESTNET',
  metadata jsonb DEFAULT '{}',
  deployed_at timestamptz DEFAULT now()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NULL,
  action text NOT NULL,
  subject_type text NULL,
  subject_id uuid NULL,
  payload jsonb NULL,
  created_at timestamptz DEFAULT now()
);

-- Views: farmer total savings (sum of goal balances)
CREATE OR REPLACE VIEW v_farmer_savings AS
SELECT f.id AS farmer_id,
       f.phone,
       COALESCE(SUM(g.balance), 0)::numeric(18,2) AS total_savings
FROM farmers f
LEFT JOIN goals g ON g.farmer_id = f.id
GROUP BY f.id, f.phone;

-- Allocate payment function (server-side allocation helper)
-- This updates goal balances using allocation_rules and records a transactions row
CREATE OR REPLACE FUNCTION allocate_payment(p_farmer uuid, p_amount numeric, p_currency text DEFAULT 'XLM', p_memo text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r RECORD;
  allocations jsonb := '[]'::jsonb;
  amt numeric;
  g RECORD;
  created_alloc jsonb;
BEGIN
  FOR r IN SELECT * FROM allocation_rules WHERE farmer_id = p_farmer ORDER BY created_at LOOP
    amt := round((r.pct::numeric / 100.0) * p_amount, 2);

    -- choose a goal that best matches the rule key
    SELECT * INTO g FROM goals WHERE farmer_id = p_farmer AND lower(name) LIKE ('%' || lower(r.key) || '%') LIMIT 1;
    IF g IS NULL THEN
      -- create a placeholder goal for this allocation
      INSERT INTO goals (farmer_id, name, target_amount, balance, currency) VALUES (p_farmer, r.key, 0, amt, p_currency) RETURNING * INTO g;
    ELSE
      UPDATE goals SET balance = balance + amt WHERE id = g.id RETURNING * INTO g;
    END IF;

    created_alloc := jsonb_build_object('key', r.key, 'pct', r.pct, 'amount', amt, 'goal_id', g.id);
    allocations := allocations || jsonb_build_array(created_alloc);
  END LOOP;

  INSERT INTO transactions (farmer_id, amount, currency, memo, allocations) VALUES (p_farmer, p_amount, p_currency, p_memo, allocations);

  RETURN allocations;
END;
$$;

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_goals_farmer ON goals(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_allocation_rules_farmer ON allocation_rules(farmer_id);

-- Optional: Row Level Security (RLS) templates for Supabase
-- NOTE: enable and adapt policies to your auth schema before turning RLS on.
-- Example: add an `auth_uid` column to `farmers` and then enable RLS to restrict rows to their owners.
-- ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Farmers can manage their row" ON farmers USING (auth.uid() = auth_uid);

-- End of schema
