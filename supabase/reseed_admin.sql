-- ==============================================================================
-- FitTrack — Re-seed public.users for the Admin
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Step 1: Get the admin user ID from auth (run this first to see the ID)
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'alaamelook89@gmail.com';

-- Step 2: Insert/upsert the gym first
INSERT INTO public.gyms (id, name, address, phone, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Power Gym',
  'Cairo, Egypt',
  '+201000000000',
  'info@powergym.com'
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Sync admin into public.users (replace UUID below with the one from Step 1)
INSERT INTO public.users (id, email, full_name, role, phone, is_active, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Alaa Melook'),
  'admin',
  NULL,
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'alaamelook89@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- Step 4: Sync admin into public.admins
INSERT INTO public.admins (user_id, gym_id, is_super_admin)
SELECT 
  u.id,
  '00000000-0000-0000-0000-000000000001',
  true
FROM auth.users u
WHERE u.email = 'alaamelook89@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Verify
SELECT u.id, u.email, u.role, u.is_active, a.is_super_admin
FROM public.users u
LEFT JOIN public.admins a ON a.user_id = u.id;
