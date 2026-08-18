-- Run this in Supabase SQL Editor to diagnose the auth schema issue
-- ==============================================================================

-- 1. Check if RLS is accidentally enabled on auth tables (MOST LIKELY CAUSE)
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 2. Check what triggers exist on auth.users
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
ORDER BY trigger_name;

-- 3. Check GoTrue can reach its schema (will error if broken)
SELECT COUNT(*) FROM auth.schema_migrations;
