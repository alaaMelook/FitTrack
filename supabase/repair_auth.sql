-- ==============================================================================
-- FitTrack — Supabase Auth Schema Repair Script
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure RLS is DISABLED on all internal auth tables (CRITICAL for GoTrue)
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.identities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.refresh_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.mfa_factors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.mfa_challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.audit_log_entries DISABLE ROW LEVEL SECURITY;

-- 2. Restore full privileges on auth schema to Supabase internal roles
GRANT USAGE ON SCHEMA auth TO postgres, supabase_auth_admin, dashboard_user, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, supabase_auth_admin, dashboard_user, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, supabase_auth_admin, dashboard_user, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, supabase_auth_admin, dashboard_user, service_role;

-- 3. Drop any custom triggers on auth.users that might be crashing GoTrue
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Clean permissions on public schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
