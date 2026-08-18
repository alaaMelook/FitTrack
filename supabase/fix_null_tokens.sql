-- ==============================================================================
-- FitTrack — Fix NULL token columns in auth.users
-- GoTrue expects empty string '' not NULL for token columns
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

UPDATE auth.users 
SET 
  confirmation_token    = COALESCE(confirmation_token, ''),
  recovery_token        = COALESCE(recovery_token, ''),
  email_change_token_new     = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change          = COALESCE(email_change, ''),
  phone_change          = COALESCE(phone_change, ''),
  phone_change_token    = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE 
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change_token_current IS NULL;

-- Verify the fix
SELECT id, email, confirmation_token, recovery_token, email_confirmed_at
FROM auth.users;
