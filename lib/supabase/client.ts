import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

/**
 * Creates a singleton Supabase client for Client Components (Browser).
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env.
 */
const KNOWN_URL = 'https://msetuzytnckcufrrsmed.supabase.co'
const KNOWN_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXR1enl0bmNrY3VmcnJzbWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzQyNTgsImV4cCI6MjEwMjY1MDI1OH0.g3YWZOuyXEu-P4NoVwLDuHcZm7RLvgQl13SLqn9gtb4'

/**
 * Creates a singleton Supabase client for Client Components (Browser).
 */
export function createClient() {
  return createBrowserClient<Database>(KNOWN_URL, KNOWN_ANON)
}


