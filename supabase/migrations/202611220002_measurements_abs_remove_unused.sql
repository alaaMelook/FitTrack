-- Migration: 202611220002_measurements_abs_remove_unused.sql
-- Adds upper_abs_cm and lower_abs_cm to measurements,
-- copies any previous waist_cm values into upper_abs_cm,
-- and drops the unused columns: back_cm, upper_body_cm, and lower_body_cm.

-- 1. Add new Upper Abs and Lower Abs columns
ALTER TABLE public.measurements
  ADD COLUMN IF NOT EXISTS upper_abs_cm NUMERIC(5,1) CHECK (upper_abs_cm IS NULL OR upper_abs_cm > 0),
  ADD COLUMN IF NOT EXISTS lower_abs_cm NUMERIC(5,1) CHECK (lower_abs_cm IS NULL OR lower_abs_cm > 0);

-- 2. Migrate existing waist_cm values to upper_abs_cm if not set
UPDATE public.measurements
SET upper_abs_cm = waist_cm
WHERE upper_abs_cm IS NULL AND waist_cm IS NOT NULL;

-- 3. Drop unused columns (back_cm, upper_body_cm, lower_body_cm)
ALTER TABLE public.measurements
  DROP COLUMN IF EXISTS back_cm,
  DROP COLUMN IF EXISTS upper_body_cm,
  DROP COLUMN IF EXISTS lower_body_cm;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
