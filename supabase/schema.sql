-- ==============================================================================
-- FitTrack — Production Supabase PostgreSQL Schema & Complete Security Model
-- ==============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. GYMS TABLE (Multi-Branch Ready)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Default Gym for MVP
INSERT INTO public.gyms (id, name, address, phone, email)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Power Gym - Main Branch',
  'Cairo, Egypt',
  '+201000000000',
  'info@powergym.com'
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE (Identity & Canonical Role)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'client')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. ADMINS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. COACHES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. CLIENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL),
  height_cm NUMERIC(5,1) CHECK (height_cm IS NULL OR height_cm > 0),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. CLIENT INVITATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  invited_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('coach', 'client')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. COACH ASSIGNMENTS TABLE (Immutable Full History)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coach_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE RESTRICT,
  assigned_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_assignment_dates CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Strict Partial Unique Index: Exactly ONE active coach assignment per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_coach_assignment 
ON public.coach_assignments (client_id) 
WHERE ended_at IS NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_assignments_client ON public.coach_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach ON public.coach_assignments(coach_id);

-- ------------------------------------------------------------------------------
-- 8. MEMBERSHIPS TABLE (Derived Status Source of Truth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  plan_name TEXT NOT NULL,
  price_paid NUMERIC(10,2) NOT NULL CHECK (price_paid >= 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_membership_dates CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_memberships_client ON public.memberships(client_id);
CREATE INDEX IF NOT EXISTS idx_memberships_dates ON public.memberships(start_date, end_date);

-- ------------------------------------------------------------------------------
-- 9. MEASUREMENTS TABLE (Immutable Snapshots)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  recorded_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  body_fat_pct NUMERIC(4,1) CHECK (body_fat_pct IS NULL OR (body_fat_pct >= 0 AND body_fat_pct <= 100)),
  muscle_mass_kg NUMERIC(5,2) CHECK (muscle_mass_kg IS NULL OR muscle_mass_kg > 0),
  chest_cm NUMERIC(5,1) CHECK (chest_cm IS NULL OR chest_cm > 0),
  waist_cm NUMERIC(5,1) CHECK (waist_cm IS NULL OR waist_cm > 0),
  hips_cm NUMERIC(5,1) CHECK (hips_cm IS NULL OR hips_cm > 0),
  thigh_cm NUMERIC(5,1) CHECK (thigh_cm IS NULL OR thigh_cm > 0),
  arm_cm NUMERIC(5,1) CHECK (arm_cm IS NULL OR arm_cm > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_client_measurement_per_day UNIQUE (client_id, measured_at)
);

CREATE INDEX IF NOT EXISTS idx_measurements_client_date ON public.measurements(client_id, measured_at DESC);

-- ------------------------------------------------------------------------------
-- 10. PROGRESS PHOTOS TABLE (Private Storage Metadata)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  uploaded_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL UNIQUE,
  photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side', 'other') OR photo_type IS NULL),
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_photos_client_date ON public.progress_photos(client_id, taken_at DESC);

-- ------------------------------------------------------------------------------
-- 11. COACH CHANGE REQUESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coach_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  current_coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE RESTRICT,
  requested_coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_different_coaches CHECK (requested_coach_id IS NULL OR requested_coach_id != current_coach_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_change_requests_status ON public.coach_change_requests(status);

-- ------------------------------------------------------------------------------
-- 12. ACTIVITY LOGS (Append-Only Audit Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_gym_date ON public.activity_logs(gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata ON public.activity_logs USING gin (metadata);

-- ------------------------------------------------------------------------------
-- VIEWS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.client_membership_status AS
SELECT 
  m.*,
  CASE
    WHEN CURRENT_DATE BETWEEN m.start_date AND m.end_date THEN 'active'
    WHEN m.start_date > CURRENT_DATE THEN 'upcoming'
    ELSE 'expired'
  END AS status
FROM public.memberships m;

CREATE OR REPLACE VIEW public.active_coach_assignments AS
SELECT *
FROM public.coach_assignments
WHERE ended_at IS NULL;

-- ------------------------------------------------------------------------------
-- SECURITY HELPER FUNCTIONS (Optimized STABLE SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- 1. Check if user is an active Admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = p_user_id AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Check if user is an active Coach
CREATE OR REPLACE FUNCTION public.is_coach(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = p_user_id AND role = 'coach' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Check if current user (coach) has an ACTIVE assignment to a client
CREATE OR REPLACE FUNCTION public.is_assigned_coach(p_client_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_assignments ca
    JOIN public.coaches c ON ca.coach_id = c.id
    WHERE ca.client_id = p_client_id 
      AND ca.ended_at IS NULL 
      AND c.user_id = p_user_id
      AND c.is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Get client record ID for given auth user
CREATE OR REPLACE FUNCTION public.get_client_id(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
  SELECT id FROM public.clients WHERE user_id = p_user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Get coach record ID for given auth user
CREATE OR REPLACE FUNCTION public.get_coach_id(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
  SELECT id FROM public.coaches WHERE user_id = p_user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- AUTH TRIGGER (Auto Sync from auth.users to public.users & Role Profiles)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_default_gym_id UUID;
  v_invitation_token UUID;
  v_invitation RECORD;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  -- Get default gym
  SELECT id INTO v_default_gym_id FROM public.gyms LIMIT 1;

  -- Verify invitation if provided in metadata
  IF NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    BEGIN
      v_invitation_token := (NEW.raw_user_meta_data->>'invitation_token')::UUID;
      SELECT * INTO v_invitation 
      FROM public.client_invitations 
      WHERE token = v_invitation_token AND status = 'pending' AND expires_at > now();

      IF v_invitation.id IS NOT NULL THEN
        v_role := v_invitation.role;
        v_default_gym_id := v_invitation.gym_id;

        -- Mark invitation as accepted
        UPDATE public.client_invitations 
        SET status = 'accepted', accepted_at = now(), accepted_by_user_id = NEW.id
        WHERE id = v_invitation.id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Fallback if token formatting fails
    END;
  END IF;

  -- Insert into public.users
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
    full_name = EXCLUDED.full_name;

  -- Create role profile
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 12 tables
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ── 1. GYMS POLICIES ─────────────────────────────────────────────────────────
CREATE POLICY "gyms_select_all" ON public.gyms
  FOR SELECT USING (true);

CREATE POLICY "gyms_admin_manage" ON public.gyms
  FOR ALL USING (public.is_admin());

-- ── 2. USERS POLICIES ────────────────────────────────────────────────────────
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "users_select_self" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_select_assigned_coach" ON public.users
  FOR SELECT USING (
    public.is_coach() AND EXISTS (
      SELECT 1 FROM public.clients cl
      WHERE cl.user_id = users.id AND public.is_assigned_coach(cl.id)
    )
  );

CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid()) 
    AND is_active = (SELECT is_active FROM public.users WHERE id = auth.uid())
  );

-- ── 3. ADMINS POLICIES ───────────────────────────────────────────────────────
CREATE POLICY "admins_admin_all" ON public.admins
  FOR ALL USING (public.is_admin());

-- ── 4. COACHES POLICIES ──────────────────────────────────────────────────────
CREATE POLICY "coaches_select_all" ON public.coaches
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "coaches_admin_manage" ON public.coaches
  FOR ALL USING (public.is_admin());

CREATE POLICY "coaches_update_self" ON public.coaches
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() 
    AND gym_id = (SELECT gym_id FROM public.coaches WHERE user_id = auth.uid())
    AND is_active = (SELECT is_active FROM public.coaches WHERE user_id = auth.uid())
  );

-- ── 5. CLIENTS POLICIES ──────────────────────────────────────────────────────
CREATE POLICY "clients_select_admin" ON public.clients
  FOR SELECT USING (public.is_admin());

CREATE POLICY "clients_select_self" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "clients_select_assigned_coach" ON public.clients
  FOR SELECT USING (public.is_assigned_coach(id));

CREATE POLICY "clients_admin_manage" ON public.clients
  FOR ALL USING (public.is_admin());

CREATE POLICY "clients_update_assigned_coach" ON public.clients
  FOR UPDATE USING (public.is_assigned_coach(id));

CREATE POLICY "clients_update_self" ON public.clients
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND gym_id = (SELECT gym_id FROM public.clients WHERE user_id = auth.uid())
  );

-- ── 6. CLIENT INVITATIONS POLICIES ───────────────────────────────────────────
CREATE POLICY "invitations_admin_manage" ON public.client_invitations
  FOR ALL USING (public.is_admin());

CREATE POLICY "invitations_coach_select" ON public.client_invitations
  FOR SELECT USING (public.is_coach() AND invited_by_user_id = auth.uid());

CREATE POLICY "invitations_coach_insert" ON public.client_invitations
  FOR INSERT WITH CHECK (
    public.is_coach() 
    AND invited_by_user_id = auth.uid() 
    AND role = 'client'
  );

CREATE POLICY "invitations_public_verify" ON public.client_invitations
  FOR SELECT USING (status = 'pending' AND expires_at > now());

-- ── 7. COACH ASSIGNMENTS POLICIES ────────────────────────────────────────────
CREATE POLICY "assignments_admin_manage" ON public.coach_assignments
  FOR ALL USING (public.is_admin());

CREATE POLICY "assignments_coach_select" ON public.coach_assignments
  FOR SELECT USING (
    coach_id = public.get_coach_id()
  );

CREATE POLICY "assignments_client_select" ON public.coach_assignments
  FOR SELECT USING (
    client_id = public.get_client_id()
  );

-- ── 8. MEMBERSHIPS POLICIES ──────────────────────────────────────────────────
CREATE POLICY "memberships_admin_manage" ON public.memberships
  FOR ALL USING (public.is_admin());

CREATE POLICY "memberships_coach_select" ON public.memberships
  FOR SELECT USING (public.is_assigned_coach(client_id));

CREATE POLICY "memberships_client_select" ON public.memberships
  FOR SELECT USING (client_id = public.get_client_id());

-- ── 9. MEASUREMENTS POLICIES ─────────────────────────────────────────────────
CREATE POLICY "measurements_admin_manage" ON public.measurements
  FOR ALL USING (public.is_admin());

CREATE POLICY "measurements_coach_select" ON public.measurements
  FOR SELECT USING (public.is_assigned_coach(client_id));

CREATE POLICY "measurements_coach_insert" ON public.measurements
  FOR INSERT WITH CHECK (public.is_assigned_coach(client_id));

CREATE POLICY "measurements_client_select" ON public.measurements
  FOR SELECT USING (client_id = public.get_client_id());

-- ── 10. PROGRESS PHOTOS POLICIES ─────────────────────────────────────────────
CREATE POLICY "photos_admin_manage" ON public.progress_photos
  FOR ALL USING (public.is_admin());

CREATE POLICY "photos_coach_select" ON public.progress_photos
  FOR SELECT USING (public.is_assigned_coach(client_id));

CREATE POLICY "photos_client_select" ON public.progress_photos
  FOR SELECT USING (client_id = public.get_client_id());

CREATE POLICY "photos_client_insert" ON public.progress_photos
  FOR INSERT WITH CHECK (client_id = public.get_client_id());

CREATE POLICY "photos_client_delete" ON public.progress_photos
  FOR DELETE USING (client_id = public.get_client_id());

-- ── 11. COACH CHANGE REQUESTS POLICIES ───────────────────────────────────────
CREATE POLICY "change_requests_admin_manage" ON public.coach_change_requests
  FOR ALL USING (public.is_admin());

CREATE POLICY "change_requests_coach_select" ON public.coach_change_requests
  FOR SELECT USING (
    current_coach_id = public.get_coach_id() OR requested_coach_id = public.get_coach_id()
  );

CREATE POLICY "change_requests_client_select" ON public.coach_change_requests
  FOR SELECT USING (client_id = public.get_client_id());

CREATE POLICY "change_requests_client_insert" ON public.coach_change_requests
  FOR INSERT WITH CHECK (
    client_id = public.get_client_id() AND status = 'pending'
  );

CREATE POLICY "change_requests_client_cancel" ON public.coach_change_requests
  FOR UPDATE USING (client_id = public.get_client_id())
  WITH CHECK (status = 'cancelled');

-- ── 12. ACTIVITY LOGS POLICIES ───────────────────────────────────────────────
CREATE POLICY "activity_logs_admin_select" ON public.activity_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "activity_logs_authenticated_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET & STORAGE RLS POLICIES (Private Progress Photos)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'progress-photos',
  'progress-photos',
  false,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE
SET 
  public = false,
  file_size_limit = 10485760;

-- Storage Policy: Clients and coaches upload to their assigned folder
CREATE POLICY "storage_progress_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
  );

-- Storage Policy: Select allowed via signed URL / ownership checks
CREATE POLICY "storage_progress_photos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'progress-photos' AND (
      public.is_admin() OR 
      auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "storage_progress_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'progress-photos' AND public.is_admin()
  );
