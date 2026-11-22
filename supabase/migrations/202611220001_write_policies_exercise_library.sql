-- Migration: 202611220001_write_policies_exercise_library.sql
-- Adds missing RLS write policies for nutrition_plans and workout_plans,
-- creates the exercise_library table with RLS, permissions, and seed data,
-- and reloads the schema cache.

-- ============================================================
-- 1. exercise_library — TABLE CREATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exercise_library (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL UNIQUE,
  muscle_group        TEXT        NOT NULL,
  description         TEXT,
  video_url           TEXT,
  created_by_user_id  UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- 1.1 Read policy: All authenticated users (Admin, Coach, Client) can view exercises
DROP POLICY IF EXISTS "exercise_library_select_all" ON public.exercise_library;
CREATE POLICY "exercise_library_select_all"
  ON public.exercise_library
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 1.2 Insert policy: Admins and Coaches can insert new exercises
DROP POLICY IF EXISTS "exercise_library_insert_staff" ON public.exercise_library;
CREATE POLICY "exercise_library_insert_staff"
  ON public.exercise_library
  FOR INSERT
  WITH CHECK (is_admin() OR is_coach());

-- 1.3 Update policy: Admins can update all; Coaches can update exercises they created
DROP POLICY IF EXISTS "exercise_library_coach_update_own" ON public.exercise_library;
CREATE POLICY "exercise_library_coach_update_own"
  ON public.exercise_library
  FOR UPDATE
  USING (is_admin() OR (is_coach() AND created_by_user_id = auth.uid()));

-- 1.4 Delete policy: Admins can delete all; Coaches can delete exercises they created
DROP POLICY IF EXISTS "exercise_library_coach_delete_own" ON public.exercise_library;
CREATE POLICY "exercise_library_coach_delete_own"
  ON public.exercise_library
  FOR DELETE
  USING (is_admin() OR (is_coach() AND created_by_user_id = auth.uid()));

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_library TO authenticated;
GRANT ALL ON public.exercise_library TO service_role;

-- ============================================================
-- 2. nutrition_plans — WRITE POLICIES
-- ============================================================

-- Coach policies
DROP POLICY IF EXISTS "nutrition_assigned_coach_insert" ON public.nutrition_plans;
CREATE POLICY "nutrition_assigned_coach_insert"
  ON public.nutrition_plans
  FOR INSERT
  WITH CHECK (is_assigned_coach(client_id) AND coach_user_id = auth.uid());

DROP POLICY IF EXISTS "nutrition_assigned_coach_update" ON public.nutrition_plans;
CREATE POLICY "nutrition_assigned_coach_update"
  ON public.nutrition_plans
  FOR UPDATE
  USING (is_assigned_coach(client_id) AND coach_user_id = auth.uid());

DROP POLICY IF EXISTS "nutrition_assigned_coach_delete" ON public.nutrition_plans;
CREATE POLICY "nutrition_assigned_coach_delete"
  ON public.nutrition_plans
  FOR DELETE
  USING (is_assigned_coach(client_id) AND coach_user_id = auth.uid());

-- Admin policies
DROP POLICY IF EXISTS "nutrition_admin_insert" ON public.nutrition_plans;
CREATE POLICY "nutrition_admin_insert"
  ON public.nutrition_plans
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "nutrition_admin_update" ON public.nutrition_plans;
CREATE POLICY "nutrition_admin_update"
  ON public.nutrition_plans
  FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "nutrition_admin_delete" ON public.nutrition_plans;
CREATE POLICY "nutrition_admin_delete"
  ON public.nutrition_plans
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 3. workout_plans — WRITE POLICIES
-- ============================================================

-- Coach policies
DROP POLICY IF EXISTS "workout_assigned_coach_insert" ON public.workout_plans;
CREATE POLICY "workout_assigned_coach_insert"
  ON public.workout_plans
  FOR INSERT
  WITH CHECK (is_assigned_coach(client_id) AND coach_user_id = auth.uid());

DROP POLICY IF EXISTS "workout_assigned_coach_update" ON public.workout_plans;
CREATE POLICY "workout_assigned_coach_update"
  ON public.workout_plans
  FOR UPDATE
  USING (is_assigned_coach(client_id) AND coach_user_id = auth.uid());

DROP POLICY IF EXISTS "workout_assigned_coach_delete" ON public.workout_plans;
CREATE POLICY "workout_assigned_coach_delete"
  ON public.workout_plans
  FOR DELETE
  USING (is_assigned_coach(client_id) AND coach_user_id = auth.uid());

-- Admin policies
DROP POLICY IF EXISTS "workout_admin_insert" ON public.workout_plans;
CREATE POLICY "workout_admin_insert"
  ON public.workout_plans
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "workout_admin_update" ON public.workout_plans;
CREATE POLICY "workout_admin_update"
  ON public.workout_plans
  FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "workout_admin_delete" ON public.workout_plans;
CREATE POLICY "workout_admin_delete"
  ON public.workout_plans
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 4. Seed: Common standard exercises (idempotent)
-- ============================================================

INSERT INTO public.exercise_library (name, muscle_group, description)
VALUES
  ('Barbell Back Squat',   'Legs',          'A compound lower-body movement using a barbell placed across the upper back.'),
  ('Conventional Deadlift','Back',          'A hip-hinge compound lift pulling a barbell from the floor to lockout.'),
  ('Bench Press',          'Chest',         'A horizontal push pressing a barbell from chest to full arm extension.'),
  ('Pull-Up',              'Back',          'An upper-body pull where the athlete raises their chin above a fixed bar.'),
  ('Overhead Press',       'Shoulders',     'A vertical push pressing a barbell from the shoulders to overhead lockout.'),
  ('Barbell Row',          'Back',          'A horizontal pull rowing a barbell toward the lower chest from a hip-hinge position.'),
  ('Dumbbell Lunges',      'Legs',          'A unilateral lower-body exercise stepping forward with dumbbells in each hand.'),
  ('Dumbbell Bicep Curl',  'Biceps',        'An isolation curl raising dumbbells from hip to shoulder through elbow flexion.'),
  ('Tricep Dips',          'Triceps',       'A bodyweight or weighted push pressing the body upward via elbow extension on parallel bars.'),
  ('Plank',                'Abs / Core',    'An isometric core exercise holding a push-up position with a neutral spine.')
ON CONFLICT (name) DO NOTHING;

-- Reload Schema Cache in PostgREST
NOTIFY pgrst, 'reload schema';
