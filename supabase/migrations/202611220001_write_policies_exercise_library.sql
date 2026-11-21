-- Migration: 202611220001_write_policies_exercise_library.sql
-- Adds missing RLS write policies for nutrition_plans and workout_plans,
-- and creates the exercise_library table with its own RLS and seed data.

-- ============================================================
-- nutrition_plans — WRITE POLICIES
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
-- workout_plans — WRITE POLICIES
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
-- exercise_library — TABLE + RLS + GRANTS + SEED
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

-- All authenticated users can read
DROP POLICY IF EXISTS "exercise_library_select_all" ON public.exercise_library;
CREATE POLICY "exercise_library_select_all"
  ON public.exercise_library
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins and coaches can insert
DROP POLICY IF EXISTS "exercise_library_insert_staff" ON public.exercise_library;
CREATE POLICY "exercise_library_insert_staff"
  ON public.exercise_library
  FOR INSERT
  WITH CHECK (is_admin() OR is_coach());

-- Admins have full control (covers UPDATE / DELETE via FOR ALL)
DROP POLICY IF EXISTS "exercise_library_admin_all" ON public.exercise_library;
CREATE POLICY "exercise_library_admin_all"
  ON public.exercise_library
  FOR ALL
  USING (is_admin());

-- Grants
GRANT SELECT ON public.exercise_library TO authenticated;
GRANT ALL    ON public.exercise_library TO service_role;

-- ============================================================
-- Seed: 10 common exercises (idempotent)
-- ============================================================

INSERT INTO public.exercise_library (name, muscle_group, description)
VALUES
  ('Barbell Back Squat',   'Legs',          'A compound lower-body movement using a barbell placed across the upper back.'),
  ('Conventional Deadlift','Back / Hamstrings', 'A hip-hinge compound lift pulling a barbell from the floor to lockout.'),
  ('Bench Press',          'Chest',         'A horizontal push pressing a barbell from chest to full arm extension.'),
  ('Pull-Up',              'Back / Biceps', 'An upper-body pull where the athlete raises their chin above a fixed bar.'),
  ('Overhead Press',       'Shoulders',     'A vertical push pressing a barbell from the shoulders to overhead lockout.'),
  ('Barbell Row',          'Back',          'A horizontal pull rowing a barbell toward the lower chest from a hip-hinge position.'),
  ('Dumbbell Lunges',      'Legs',          'A unilateral lower-body exercise stepping forward with dumbbells in each hand.'),
  ('Dumbbell Bicep Curl',  'Biceps',        'An isolation curl raising dumbbells from hip to shoulder through elbow flexion.'),
  ('Tricep Dips',          'Triceps',       'A bodyweight or weighted push pressing the body upward via elbow extension on parallel bars.'),
  ('Plank',                'Core',          'An isometric core exercise holding a push-up position with a neutral spine.')
ON CONFLICT (name) DO NOTHING;
