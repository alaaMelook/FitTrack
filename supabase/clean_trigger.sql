-- ==============================================================================
-- FitTrack — Clean Trigger & Remove Foreign Key on auth.users
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Replace the trigger function with a clean, no-op return
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 2. Drop any foreign key constraints from public.users to auth.users if conflicting
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Delete in correct FK order (children before parents)
DELETE FROM public.activity_logs;
DELETE FROM public.coach_change_requests;
DELETE FROM public.progress_photos;
DELETE FROM public.measurements;
DELETE FROM public.memberships;
DELETE FROM public.coach_assignments;
DELETE FROM public.clients;
DELETE FROM public.coaches;
DELETE FROM public.admins;
DELETE FROM public.gyms;
DELETE FROM public.users;
