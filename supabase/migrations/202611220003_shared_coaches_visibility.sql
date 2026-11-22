-- Migration: Add shared_coach_ids to nutrition_plans and workout_plans
-- Allows Admins to share specific plans with multiple selected coaches

ALTER TABLE public.nutrition_plans
  ADD COLUMN IF NOT EXISTS shared_coach_ids UUID[] NOT NULL DEFAULT '{}';

ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS shared_coach_ids UUID[] NOT NULL DEFAULT '{}';

-- Fast array lookup index
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_shared_coaches ON public.nutrition_plans USING GIN(shared_coach_ids);
CREATE INDEX IF NOT EXISTS idx_workout_plans_shared_coaches ON public.workout_plans USING GIN(shared_coach_ids);

-- Update RLS policies to allow shared coaches to view the plans
DROP POLICY IF EXISTS nutrition_assigned_coach_read ON public.nutrition_plans;
DROP POLICY IF EXISTS nutrition_shared_coach_read ON public.nutrition_plans;

CREATE POLICY nutrition_shared_coach_read ON public.nutrition_plans
  FOR SELECT USING (
    coach_user_id = auth.uid() OR
    auth.uid() = ANY(shared_coach_ids) OR
    public.is_admin() OR
    public.is_assigned_coach(client_id)
  );

DROP POLICY IF EXISTS workout_assigned_coach_read ON public.workout_plans;
DROP POLICY IF EXISTS workout_shared_coach_read ON public.workout_plans;

CREATE POLICY workout_shared_coach_read ON public.workout_plans
  FOR SELECT USING (
    coach_user_id = auth.uid() OR
    auth.uid() = ANY(shared_coach_ids) OR
    public.is_admin() OR
    public.is_assigned_coach(client_id)
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
