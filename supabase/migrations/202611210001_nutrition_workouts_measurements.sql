ALTER TABLE public.measurements
  ADD COLUMN IF NOT EXISTS upper_body_cm NUMERIC(5,1) CHECK (upper_body_cm IS NULL OR upper_body_cm > 0),
  ADD COLUMN IF NOT EXISTS lower_body_cm NUMERIC(5,1) CHECK (lower_body_cm IS NULL OR lower_body_cm > 0);

CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  notes TEXT,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(meals) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_client_updated ON public.nutrition_plans(client_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  notes TEXT,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(schedule) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workout_plans_client_updated ON public.workout_plans(client_id, updated_at DESC);

ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nutrition_admin_read ON public.nutrition_plans;
CREATE POLICY nutrition_admin_read ON public.nutrition_plans FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS nutrition_client_read_own ON public.nutrition_plans;
CREATE POLICY nutrition_client_read_own ON public.nutrition_plans FOR SELECT USING (client_id = public.get_client_id());
DROP POLICY IF EXISTS nutrition_assigned_coach_read ON public.nutrition_plans;
CREATE POLICY nutrition_assigned_coach_read ON public.nutrition_plans FOR SELECT USING (public.is_assigned_coach(client_id));
DROP POLICY IF EXISTS workout_admin_read ON public.workout_plans;
CREATE POLICY workout_admin_read ON public.workout_plans FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS workout_client_read_own ON public.workout_plans;
CREATE POLICY workout_client_read_own ON public.workout_plans FOR SELECT USING (client_id = public.get_client_id());
DROP POLICY IF EXISTS workout_assigned_coach_read ON public.workout_plans;
CREATE POLICY workout_assigned_coach_read ON public.workout_plans FOR SELECT USING (public.is_assigned_coach(client_id));

GRANT SELECT ON public.nutrition_plans, public.workout_plans TO authenticated;
GRANT ALL ON public.nutrition_plans, public.workout_plans TO service_role;

UPDATE public.gyms SET name = 'FitTrack' WHERE id IN ('a0000000-0000-0000-0000-000000000001'::uuid,'00000000-0000-0000-0000-000000000001'::uuid);
