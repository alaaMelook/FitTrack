import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const adminSupabase = createAdminClient()

    const { data: coachesData, error: coachesError } = await adminSupabase
      .from('coaches')
      .select('id, user_id, bio, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (coachesError) {
      console.error('[/api/coaches] coaches query error:', coachesError)
      return NextResponse.json({ coaches: [], error: coachesError.message }, { status: 200 })
    }

    if (!coachesData || coachesData.length === 0) {
      return NextResponse.json({ coaches: [] }, { status: 200 })
    }

    const userIds = coachesData.map((c: any) => c.user_id).filter(Boolean)
    const { data: usersData, error: usersError } = await adminSupabase
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

    const coaches = coachesData.map((c: any) => {
      const u = userMap[c.user_id]
      return {
        id: c.id,
        bio: c.bio,
        name: u?.full_name || 'Coach',
        email: u?.email || '',
      }
    })

    return NextResponse.json({ coaches }, { status: 200 })
  } catch (err: any) {
    console.error('[/api/coaches] unexpected error:', err)
    return NextResponse.json({ coaches: [], error: err.message }, { status: 200 })
  }
}
