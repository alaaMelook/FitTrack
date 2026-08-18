-- ==============================================================================
-- Add custom body measurement columns: calf, back, glutes, abs, leg
-- ==============================================================================

ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS calf_cm NUMERIC(5,1);
ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS back_cm NUMERIC(5,1);
ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS glutes_cm NUMERIC(5,1);
ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS abs_cm NUMERIC(5,1);
ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS leg_cm NUMERIC(5,1);
