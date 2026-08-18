import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/types'

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses the user's session cookie (anon key + RLS).
 *
 * IMPORTANT: This function must only be called from server-side code.
 */
const KNOWN_URL = 'https://msetuzytnckcufrrsmed.supabase.co'
const KNOWN_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXR1enl0bmNrY3VmcnJzbWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzQyNTgsImV4cCI6MjEwMjY1MDI1OH0.g3YWZOuyXEu-P4NoVwLDuHcZm7RLvgQl13SLqn9gtb4'

function sanitize(val?: string): string {
  if (!val) return ''
  return val.trim().replace(/^["']|["']$/g, '')
}

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses the user's session cookie (anon key + RLS).
 *
 * IMPORTANT: This function must only be called from server-side code.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const envUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const envAnon = sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const supabaseUrl = envUrl || KNOWN_URL
  const supabaseAnonKey = envAnon && envAnon.split('.').length === 3 ? envAnon : KNOWN_ANON

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

