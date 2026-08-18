-- ==============================================================================
-- FitTrack — Fix Auth Trigger & Permissions Script
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure pgcrypto extension is active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Grant necessary table permissions to supabase auth admin & service roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role, supabase_auth_admin;

-- 3. Make sure default gym exists
INSERT INTO public.gyms (id, name, address, phone, email)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Power Gym - Main Branch',
  'Cairo, Egypt',
  '+201000000000',
  'info@powergym.com'
) ON CONFLICT (id) DO NOTHING;

-- 4. Robust, fail-safe Auth Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_default_gym_id UUID;
BEGIN
  -- Extract metadata safely
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  -- Get default gym ID
  SELECT id INTO v_default_gym_id FROM public.gyms LIMIT 1;
  IF v_default_gym_id IS NULL THEN
    v_default_gym_id := 'a0000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  -- 1. Insert into public.users
  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    NEW.raw_user_meta_data->>'phone',
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  -- 2. Insert into appropriate profile table
  IF v_role = 'admin' THEN
    INSERT INTO public.admins (user_id, gym_id)
    VALUES (NEW.id, v_default_gym_id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'coach' THEN
    INSERT INTO public.coaches (user_id, gym_id)
    VALUES (NEW.id, v_default_gym_id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO public.clients (user_id, gym_id)
    VALUES (NEW.id, v_default_gym_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log warning but do not crash auth
  RAISE WARNING 'handle_new_auth_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 5. Re-bind Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 6. Clean reset Admin user in auth.users and public.users
DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_gym_id UUID;
BEGIN
  SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'alaamelook89@gmail.com') THEN
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Admin@123456', gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = '{"full_name":"Alaa Melook","role":"admin"}'::jsonb
    WHERE email = 'alaamelook89@gmail.com';
    
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'alaamelook89@gmail.com';
  ELSE
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'alaamelook89@gmail.com',
      crypt('Admin@123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Alaa Melook","role":"admin"}'::jsonb,
      'authenticated', 'authenticated', now(), now()
    );
  END IF;

  -- Ensure public.users and public.admins rows exist
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (v_admin_id, 'alaamelook89@gmail.com', 'Alaa Melook', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Alaa Melook';

  INSERT INTO public.admins (user_id, gym_id)
  VALUES (v_admin_id, v_gym_id)
  ON CONFLICT (user_id) DO NOTHING;

END $$;
