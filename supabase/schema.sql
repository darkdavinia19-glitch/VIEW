-- ==============================================================================
-- FAUCETFLOW / CRYPTO REWARD ENGINE - SUPABASE POSTGRESQL SCHEMA
-- Project ID: wgywqbehvzhmwzazmkbd
-- Super Admin: darkdavinia19@gmail.com
-- Global Constraints: Minimum withdrawal = 0.1
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROFILES TABLE (Linked with Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- ==============================================================================
-- 3. WALLET BALANCES TABLE (High precision crypto balances)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    balance NUMERIC(28, 8) NOT NULL DEFAULT 0.00000000 CHECK (balance >= 0),
    frozen_balance NUMERIC(28, 8) NOT NULL DEFAULT 0.00000000 CHECK (frozen_balance >= 0),
    total_earned NUMERIC(28, 8) NOT NULL DEFAULT 0.00000000 CHECK (total_earned >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_wallet_balances_user ON public.wallet_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_symbol ON public.wallet_balances(symbol);

-- ==============================================================================
-- 4. WITHDRAWALS TABLE (With strict min 0.1 constraint)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coin TEXT NOT NULL,
    amount NUMERIC(28, 8) NOT NULL CHECK (amount >= 0.1), -- STRICT GLOBAL MIN 0.1
    address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'MAINNET',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED')),
    tx_id TEXT,
    review_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);

-- ==============================================================================
-- 5. FAUCET CLAIMS TABLE (Track cooldowns and claims)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.faucet_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coin TEXT NOT NULL,
    amount NUMERIC(28, 8) NOT NULL CHECK (amount > 0),
    cooldown_until TIMESTAMP WITH TIME ZONE NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_faucet_claims_user_coin ON public.faucet_claims(user_id, coin);
CREATE INDEX IF NOT EXISTS idx_faucet_claims_claimed_at ON public.faucet_claims(claimed_at DESC);

-- ==============================================================================
-- 6. TRANSACTIONS / AUDIT LEDGER (Immutable double-entry log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('FAUCET_CLAIM', 'WITHDRAWAL_REQUEST', 'WITHDRAWAL_REFUND', 'WITHDRAWAL_COMPLETE', 'OFFERWALL_REWARD', 'REFERRAL_COMMISSION', 'PTC_CLICK', 'ADMIN_ADJUSTMENT')),
    coin TEXT NOT NULL,
    amount NUMERIC(28, 8) NOT NULL,
    fee NUMERIC(28, 8) NOT NULL DEFAULT 0,
    reference_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- ==============================================================================
-- 7. OFFERWALL CALLBACKS (Webhooks from AdGem, Lootably, CPX, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.offerwall_callbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    external_tx_id TEXT UNIQUE,
    payout_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
    reward_points NUMERIC(16, 2) NOT NULL DEFAULT 0,
    signature TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'REVERSED', 'PENDING')),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_offerwall_callbacks_user ON public.offerwall_callbacks(user_id);

-- ==============================================================================
-- 8. PTC ADS (Paid-To-Click Campaigns)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ptc_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    target_url TEXT NOT NULL,
    reward_amount NUMERIC(28, 8) NOT NULL,
    coin TEXT NOT NULL DEFAULT 'USDT',
    duration_seconds INTEGER NOT NULL DEFAULT 15,
    daily_limit INTEGER NOT NULL DEFAULT 500,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 9. SYSTEM SETTINGS & AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Default system settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('global_min_withdrawal', '"0.1"', 'Universal minimum withdrawal amount across all assets'),
    ('referral_bps', '1000', '10% referral commission (1000 BPS)'),
    ('faucet_cooldown_seconds', '60', 'Standard faucet cooldown per claim (1 minute)'),
    ('platform_mode', '"LIVE"', 'Operating network state (LIVE vs DEMO)')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- ==============================================================================
-- 10. AUTOMATIC USER REGISTRATION TRIGGER
-- Whenever a user signs up via Supabase Auth, automatically creates their
-- profile, assigns role, and seeds initial cryptocurrency wallets!
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    user_ref_code TEXT;
BEGIN
    -- Super Admin condition for darkdavinia19@gmail.com
    IF NEW.email = 'darkdavinia19@gmail.com' THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := 'user';
    END IF;

    -- Generate a clean 8-character referral code
    user_ref_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));

    -- 1. Insert Profile
    INSERT INTO public.profiles (id, email, username, role, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        assigned_role,
        user_ref_code
    )
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        role = CASE WHEN EXCLUDED.email = 'darkdavinia19@gmail.com' THEN 'admin' ELSE public.profiles.role END;

    -- 2. Initialize default multi-currency wallet balances
    INSERT INTO public.wallet_balances (user_id, symbol, balance, total_earned)
    VALUES 
        (NEW.id, 'USDT', 0.00000000, 0.00000000),
        (NEW.id, 'BTC',  0.00000000, 0.00000000),
        (NEW.id, 'ETH',  0.00000000, 0.00000000),
        (NEW.id, 'SOL',  0.00000000, 0.00000000),
        (NEW.id, 'DOGE', 0.00000000, 0.00000000),
        (NEW.id, 'LTC',  0.00000000, 0.00000000),
        (NEW.id, 'TRX',  0.00000000, 0.00000000),
        (NEW.id, 'BNB',  0.00000000, 0.00000000),
        (NEW.id, 'MATIC',0.00000000, 0.00000000),
        (NEW.id, 'FEY',  0.00000000, 0.00000000)
    ON CONFLICT (user_id, symbol) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faucet_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerwall_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptc_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'email' = 'darkdavinia19@gmail.com' OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own non-role profile" ON public.profiles;
CREATE POLICY "Users can update own non-role profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- --- WALLET BALANCES POLICIES ---
DROP POLICY IF EXISTS "Users view own balances" ON public.wallet_balances;
CREATE POLICY "Users view own balances" ON public.wallet_balances
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- --- WITHDRAWALS POLICIES ---
DROP POLICY IF EXISTS "Users view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users view own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can request withdrawal" ON public.withdrawals;
CREATE POLICY "Users can request withdrawal" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id AND amount >= 0.1);

DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can update withdrawals" ON public.withdrawals
    FOR UPDATE USING (public.is_admin());

-- --- FAUCET CLAIMS POLICIES ---
DROP POLICY IF EXISTS "Users view own claims" ON public.faucet_claims;
CREATE POLICY "Users view own claims" ON public.faucet_claims
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert claims" ON public.faucet_claims;
CREATE POLICY "Users insert claims" ON public.faucet_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- --- TRANSACTIONS POLICIES ---
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
CREATE POLICY "Users view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- --- PTC ADS POLICIES ---
DROP POLICY IF EXISTS "Anyone can view active PTC ads" ON public.ptc_ads;
CREATE POLICY "Anyone can view active PTC ads" ON public.ptc_ads
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage PTC ads" ON public.ptc_ads;
CREATE POLICY "Admins manage PTC ads" ON public.ptc_ads
    FOR ALL USING (public.is_admin());

-- --- SYSTEM SETTINGS POLICIES ---
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings" ON public.system_settings
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage system settings" ON public.system_settings;
CREATE POLICY "Admins manage system settings" ON public.system_settings
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- 12. DIRECT COMMAND TO PROMOTE darkdavinia19@gmail.com TO ADMIN
-- Run this block anytime to make sure darkdavinia19@gmail.com is Super Admin
-- ==============================================================================
-- Create or upgrade profile if user already exists in auth.users
INSERT INTO public.profiles (id, email, username, role, referral_code)
SELECT 
    id, 
    email, 
    'SuperAdmin', 
    'admin', 
    'ADMINVIP'
FROM auth.users 
WHERE email = 'darkdavinia19@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', updated_at = NOW();

-- Also ensure darkdavinia19@gmail.com in public.profiles is set to 'admin'
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'darkdavinia19@gmail.com';

-- Verification query
SELECT id, email, username, role, created_at 
FROM public.profiles 
WHERE email = 'darkdavinia19@gmail.com';
