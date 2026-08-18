-- ==============================================================================
-- FitTrack — Add dedicated body measurement columns for Calf and Back
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS calf_cm NUMERIC(5,1);
ALTER TABLE public.measurements ADD COLUMN IF NOT EXISTS back_cm NUMERIC(5,1);
