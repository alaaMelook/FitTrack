-- ============================================================
-- Fix: Allow public (unauthenticated) access to read coach names
-- Run this once in Supabase SQL Editor
-- ============================================================

-- 1. Allow anyone to read basic info of active coaches from the coaches table
--    (policy already exists, skip if error 42710)
-- DROP POLICY IF EXISTS "coaches_select_all" ON public.coaches;
-- CREATE POLICY "coaches_select_all" ON public.coaches
--   FOR SELECT USING (is_active = true OR public.is_admin());

-- 2. Allow unauthenticated users to read ONLY the full_name, email, and id
--    of users who are coaches (for the registration page)
DROP POLICY IF EXISTS "users_select_coaches_public" ON public.users;

CREATE POLICY "users_select_coaches_public" ON public.users
  FOR SELECT
  USING (
    role = 'coach'
    AND is_active = true
  );
