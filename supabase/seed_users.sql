-- ==============================================================================
-- FitTrack — Seed Users & Demo Data Script
-- Run this in Supabase Dashboard -> SQL Editor AFTER running schema.sql
-- ==============================================================================

DO $$
DECLARE
  v_gym_id UUID;
  v_admin_id UUID := gen_random_uuid();
  v_coach_id UUID := gen_random_uuid();
  v_client_id UUID := gen_random_uuid();
  
  v_coach_profile_id UUID;
  v_client_profile_id UUID;
BEGIN
  -- 1. Get the default gym ID
  SELECT id INTO v_gym_id FROM public.gyms LIMIT 1;

  -- ─── 1. CREATE ADMIN: alaamelook89@gmail.com ────────────────────────────────
  -- Password: Admin@123456
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'alaamelook89@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'alaamelook89@gmail.com',
      crypt('Admin@123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Alaa Melook","role":"admin","phone":"+201000000001"}'::jsonb,
      'authenticated',
      'authenticated',
      now(),
      now()
    );
  END IF;

  -- ─── 2. CREATE DEMO COACH: coach@fittrack.com ───────────────────────────────
  -- Password: Coach@123456
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'coach@fittrack.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      v_coach_id,
      '00000000-0000-0000-0000-000000000000',
      'coach@fittrack.com',
      crypt('Coach@123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Coach Ahmed Hassan","role":"coach","phone":"+201000000002"}'::jsonb,
      'authenticated',
      'authenticated',
      now(),
      now()
    );
  ELSE
    SELECT id INTO v_coach_id FROM auth.users WHERE email = 'coach@fittrack.com';
  END IF;

  -- ─── 3. CREATE DEMO CLIENT: client@fittrack.com ─────────────────────────────
  -- Password: Client@123456
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@fittrack.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      v_client_id,
      '00000000-0000-0000-0000-000000000000',
      'client@fittrack.com',
      crypt('Client@123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Sara Mohamed","role":"client","phone":"+201000000003"}'::jsonb,
      'authenticated',
      'authenticated',
      now(),
      now()
    );
  ELSE
    SELECT id INTO v_client_id FROM auth.users WHERE email = 'client@fittrack.com';
  END IF;

  -- Get profile IDs
  SELECT id INTO v_coach_profile_id FROM public.coaches WHERE user_id = v_coach_id LIMIT 1;
  SELECT id INTO v_client_profile_id FROM public.clients WHERE user_id = v_client_id LIMIT 1;

  -- Update Coach bio
  IF v_coach_profile_id IS NOT NULL THEN
    UPDATE public.coaches 
    SET bio = 'Certified Strength & Conditioning Specialist with 7+ years of experience in hypertrophy and athletic performance.'
    WHERE id = v_coach_profile_id;
  END IF;

  -- Update Client metrics
  IF v_client_profile_id IS NOT NULL THEN
    UPDATE public.clients
    SET 
      gender = 'female',
      height_cm = 168.5,
      date_of_birth = '1998-05-15',
      emergency_contact_name = 'Mohamed Ali',
      emergency_contact_phone = '+201099998888',
      notes = 'Goal: Muscle toning and strength improvement. No medical restrictions.'
    WHERE id = v_client_profile_id;

    -- ─── 4. ASSIGN CLIENT TO COACH ───────────────────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM public.coach_assignments WHERE client_id = v_client_profile_id AND ended_at IS NULL) THEN
      INSERT INTO public.coach_assignments (client_id, coach_id, assigned_by_user_id, started_at)
      VALUES (v_client_profile_id, v_coach_profile_id, v_admin_id, now());
    END IF;

    -- ─── 5. CREATE ACTIVE MEMBERSHIP FOR CLIENT ──────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE client_id = v_client_profile_id) THEN
      INSERT INTO public.memberships (
        client_id,
        gym_id,
        plan_name,
        price_paid,
        currency,
        start_date,
        end_date,
        payment_method,
        payment_reference,
        notes,
        created_by_user_id
      ) VALUES (
        v_client_profile_id,
        v_gym_id,
        'VIP Quarterly Membership',
        2400.00,
        'EGP',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '75 days',
        'cash',
        'REC-2026-001',
        'Includes full gym access and personalized coach assignment.',
        v_admin_id
      );
    END IF;

    -- ─── 6. INSERT SAMPLE MEASUREMENT FOR CLIENT ─────────────────────────────
    IF NOT EXISTS (SELECT 1 FROM public.measurements WHERE client_id = v_client_profile_id) THEN
      INSERT INTO public.measurements (
        client_id,
        recorded_by_user_id,
        measured_at,
        weight_kg,
        body_fat_pct,
        muscle_mass_kg,
        chest_cm,
        waist_cm,
        hips_cm,
        thigh_cm,
        arm_cm,
        notes
      ) VALUES (
        v_client_profile_id,
        v_coach_id,
        CURRENT_DATE - INTERVAL '14 days',
        64.50,
        22.5,
        28.20,
        88.0,
        68.0,
        96.0,
        54.0,
        27.5,
        'Initial baseline fitness assessment.'
      );
    END IF;

  END IF;

END $$;
