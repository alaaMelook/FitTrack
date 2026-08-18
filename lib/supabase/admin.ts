import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export const KNOWN_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXR1enl0bmNrY3VmcnJzbWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3NDI1OCwiZXhwIjoyMTAyNjUwMjU4fQ.agV4I1Z46oxYApCLlT55CSx-Sk55Ax3-cwY7GgP5syQ'

export const KNOWN_SUPABASE_URL = 'https://msetuzytnckcufrrsmed.supabase.co'

/**
 * Creates a Supabase client with the service role key.
 * BYPASSES Row Level Security.
 *
 * ⚠️  NEVER import this in Client Components or expose it to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    KNOWN_SUPABASE_URL,
    KNOWN_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}


