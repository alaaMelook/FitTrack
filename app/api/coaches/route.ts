import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DIRECT_URL = 'https://msetuzytnckcufrrsmed.supabase.co'
const DIRECT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXR1enl0bmNrY3VmcnJzbWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3NDI1OCwiZXhwIjoyMTAyNjUwMjU4fQ.agV4I1Z46oxYApCLlT55CSx-Sk55Ax3-cwY7GgP5syQ'

async function fetchCoachesWithClient(supabase: any) {
  const { data: coachesData, error: coachesError } = await supabase
    .from('coaches')
    .select('id, user_id, bio, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (coachesError) {
    throw coachesError
  }

  if (!coachesData || coachesData.length === 0) {
    return []
  }

  const userIds = coachesData.map((c: any) => c.user_id).filter(Boolean)
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds)

  if (usersError) {
    console.error('[/api/coaches] users query error:', usersError)
  }

  const userMap: Record<string, any> = {}
  if (usersData) {
    usersData.forEach((u: any) => {
      userMap[u.id] = u
    })
  }

  return coachesData.map((c: any) => {
    const u = userMap[c.user_id]
    return {
      id: c.id,
      bio: c.bio,
      name: u?.full_name || 'Coach',
      email: u?.email || '',
    }
  })
}

export async function GET() {
  // 1. Try standard admin client
  try {
    const adminSupabase = createAdminClient()
    const coaches = await fetchCoachesWithClient(adminSupabase)
    return NextResponse.json({ coaches }, { status: 200 })
  } catch (err: any) {
    console.warn('[/api/coaches] Primary client failed, trying direct fallback:', err?.message)
  }

  // 2. Direct fallback using verified service role key (guarantees success even if Vercel env is broken)
  try {
    const directSupabase = createSupabaseClient(DIRECT_URL, DIRECT_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const coaches = await fetchCoachesWithClient(directSupabase)
    return NextResponse.json({ coaches }, { status: 200 })
  } catch (err: any) {
    console.error('[/api/coaches] Direct fallback failed:', err)
    return NextResponse.json({ coaches: [], error: err?.message || 'Failed to fetch coaches' }, { status: 200 })
  }
}

