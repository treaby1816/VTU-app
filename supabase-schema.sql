-- ============================================================
-- VaultPay — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Profiles table (extends Supabase auth.users) ──────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Transactions table (the wallet ledger) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  service     TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  phone       TEXT,
  network     TEXT,
  ref         TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ref     ON public.transactions(ref);
CREATE INDEX IF NOT EXISTS idx_transactions_status  ON public.transactions(status);

-- ── 3. Wallet balance function (computed — no static balance column) ──────
-- This is the ONLY source of truth for balance
CREATE OR REPLACE FUNCTION public.get_wallet_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(
    SUM(
      CASE
        WHEN type = 'credit' AND status = 'success' THEN  amount
        WHEN type = 'debit'  AND status IN ('pending', 'success') THEN -amount
        ELSE 0
      END
    ), 0
  )
  FROM public.transactions
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 4. Auto-create profile on user signup ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 5. Row Level Security (RLS) ───────────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Transactions: users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Transactions: insert allowed for authenticated users (API routes use service role)
CREATE POLICY "Service role can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (TRUE);  -- Enforced at API layer; service role bypasses RLS

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ── 6. Prevent negative balance trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_balance_before_debit()
RETURNS TRIGGER AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  IF NEW.type = 'debit' THEN
    -- Pessimistic row-locking to serialize debit transactions for the user
    PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    
    SELECT public.get_wallet_balance(NEW.user_id) INTO current_balance;
    IF current_balance < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient wallet balance. Balance: %, Requested: %', current_balance, NEW.amount;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_negative_balance ON public.transactions;
CREATE TRIGGER prevent_negative_balance
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.check_balance_before_debit();

-- ── 7. Grant permissions ──────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_wallet_balance TO authenticated, service_role;

-- ── 8. Provider Tracking ──────────────────────────────────────────────────
-- Add provider tracking columns to transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'vtung',
  ADD COLUMN IF NOT EXISTS provider_ref TEXT;

-- Index for provider analytics
CREATE INDEX IF NOT EXISTS idx_transactions_provider 
  ON public.transactions(provider);

-- ── 9. Enterprise Telemetry & Provider Health ─────────────────────────────

-- Table to store global provider health status across serverless instances
CREATE TABLE IF NOT EXISTS public.provider_health (
    provider_name TEXT PRIMARY KEY,
    status TEXT DEFAULT 'healthy', -- 'healthy' or 'cooldown'
    failed_at TIMESTAMP WITH TIME ZONE,
    cooldown_until TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table to log all API requests and their latency
CREATE TABLE IF NOT EXISTS public.api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    service_type TEXT, -- 'airtime' or 'data'
    request_payload JSONB,
    response_payload JSONB,
    status_code INTEGER,
    is_success BOOLEAN NOT NULL,
    latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for querying API telemetry
CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON public.api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs(created_at);

-- ── 10. Fafotech Multi-Provider Updates & Margin Analytics ─────────────────

-- Update provider column constraint to include fafotech
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_provider_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_provider_check
  CHECK (provider IN ('fafotech','smeplug','datastation','n3tdata','vtung'));

-- Track provider cost for margin analysis
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS provider_cost NUMERIC(12,2);

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS margin NUMERIC(12,2) 
  GENERATED ALWAYS AS (amount - COALESCE(provider_cost, 0)) STORED;

-- View: profit by provider (useful for admin analytics)
CREATE OR REPLACE VIEW public.provider_margins AS
SELECT
  provider,
  COUNT(*)                          AS total_transactions,
  SUM(amount)                       AS total_revenue,
  SUM(provider_cost)                AS total_cost,
  SUM(margin)                       AS total_margin,
  ROUND(AVG(margin), 2)             AS avg_margin_per_tx,
  COUNT(*) FILTER (WHERE status = 'success') AS successful,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success') * 100.0 / NULLIF(COUNT(*), 0), 1
  )                                 AS success_rate_pct
FROM public.transactions
WHERE type = 'debit'
GROUP BY provider
ORDER BY total_margin DESC;

-- ── 11. Multi-Tenant Whitelabel Reseller Extensions ───────────────────────

-- A. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  subdomain      TEXT UNIQUE NOT NULL,                       -- e.g., 'mobipay' (for mobipay.vaultpay.com)
  custom_domain  TEXT UNIQUE,                                 -- e.g., 'vtu.mobipay.com'
  logo_url       TEXT,
  primary_color  TEXT DEFAULT '#00D4AA',
  parent_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- The reseller profile owner
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. Tenant Pricing Table
-- This stores the custom retail and wholesale price per bundle/service for each reseller
CREATE TABLE IF NOT EXISTS public.tenant_pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  service_type    TEXT NOT NULL CHECK (service_type IN ('airtime', 'data')),
  service_name    TEXT NOT NULL,              -- e.g. 'MTN_SME_1GB', 'AIRTIME_MTN'
  retail_price    NUMERIC(12, 2) NOT NULL CHECK (retail_price >= 0),
  wholesale_price NUMERIC(12, 2) NOT NULL CHECK (wholesale_price >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, service_type, service_name)
);

-- C. Add tenant_id columns to Profiles and Transactions
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- D. Index tenant fields for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON public.tenants(custom_domain);

-- E. RLS Policy Updates for Multi-Tenancy

-- Allow anonymous and authenticated select on Tenants so middleware can load domain branding
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can select active tenants" ON public.tenants;
CREATE POLICY "Anyone can select active tenants"
  ON public.tenants FOR SELECT
  USING (is_active = TRUE);

-- Update Profiles RLS:
-- 1. Users can select own profile (pre-existing)
-- 2. Resellers can see profiles of users registered under their tenant
DROP POLICY IF EXISTS "Resellers can view tenant profiles" ON public.profiles;
CREATE POLICY "Resellers can view tenant profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = profiles.tenant_id AND tenants.parent_id = auth.uid()
    )
  );

-- Update Transactions RLS:
-- 1. Users can select own transactions (pre-existing)
-- 2. Resellers can see transactions under their tenant
DROP POLICY IF EXISTS "Resellers can view tenant transactions" ON public.transactions;
CREATE POLICY "Resellers can view tenant transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = transactions.tenant_id AND tenants.parent_id = auth.uid()
    )
  );

-- Grant privileges to authenticated role for new tables
GRANT SELECT ON public.tenants TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_pricing TO authenticated;

-- ── 12. Notifications Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;

-- ── 13. Referral Rewards Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  service_type     TEXT NOT NULL CHECK (service_type IN ('airtime', 'data')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON public.referral_rewards(referred_user_id);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.referral_rewards TO authenticated;

-- ── 14. Security Columns for Profiles ─────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS transaction_pin TEXT,
  ADD COLUMN IF NOT EXISTS security_questions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pin_reset_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_reset_locked_until TIMESTAMPTZ;

-- ── 15. Secure Transaction PIN Reset RPC (with brute-force protection) ────
CREATE OR REPLACE FUNCTION public.verify_security_question_and_reset_pin(
  p_user_id UUID,
  p_answer TEXT,
  p_new_pin TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_questions JSONB;
  v_correct_answer TEXT;
  v_attempts INT;
  v_locked_until TIMESTAMPTZ;
BEGIN
  -- Row-lock profile for safety
  SELECT security_questions, pin_reset_attempts, pin_reset_locked_until
    FROM public.profiles
    WHERE id = p_user_id
    INTO v_questions, v_attempts, v_locked_until
    FOR UPDATE;

  -- Check brute-force lockout (5 failed attempts = 30 minute lock)
  IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
    RAISE EXCEPTION 'Too many failed attempts. Please try again after %.',
      TO_CHAR(v_locked_until, 'HH24:MI');
  END IF;

  IF v_questions IS NULL OR jsonb_array_length(v_questions) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Extract answer from first question
  v_correct_answer := v_questions->0->>'answer';

  IF LOWER(TRIM(p_answer)) = LOWER(TRIM(v_correct_answer)) THEN
    -- Correct answer: reset PIN and clear attempt counters
    UPDATE public.profiles
    SET transaction_pin = p_new_pin,
        pin_reset_attempts = 0,
        pin_reset_locked_until = NULL
    WHERE id = p_user_id;

    RETURN TRUE;
  ELSE
    -- Wrong answer: increment attempts
    v_attempts := COALESCE(v_attempts, 0) + 1;

    IF v_attempts >= 5 THEN
      -- Lock for 30 minutes
      UPDATE public.profiles
      SET pin_reset_attempts = v_attempts,
          pin_reset_locked_until = NOW() + INTERVAL '30 minutes'
      WHERE id = p_user_id;
    ELSE
      UPDATE public.profiles
      SET pin_reset_attempts = v_attempts
      WHERE id = p_user_id;
    END IF;

    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.verify_security_question_and_reset_pin TO authenticated;
