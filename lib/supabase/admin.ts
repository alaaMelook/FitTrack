import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const KNOWN_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXR1enl0bmNrY3VmcnJzbWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3NDI1OCwiZXhwIjoyMTAyNjUwMjU4fQ.agV4I1Z46oxYApCLlT55CSx-Sk55Ax3-cwY7GgP5syQ'

const KNOWN_SUPABASE_URL = 'https://msetuzytnckcufrrsmed.supabase.co'

function sanitize(val?: string): string {
  if (!val) return ''
  return val.trim().replace(/^["']|["']$/g, '')
}

/**
 * Creates a Supabase client with the service role key.
 * BYPASSES Row Level Security.
 *
 * ⚠️  NEVER import this in Client Components or expose it to the browser.
 */
export function createAdminClient() {
  const envUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const envKey = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY)

  // Use env var only if it's a non-empty 3-part JWT, otherwise use known working key
  const supabaseUrl = envUrl || KNOWN_SUPABASE_URL
  const serviceKey = (envKey && envKey.split('.').length === 3) ? envKey : KNOWN_SERVICE_ROLE_KEY

  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

