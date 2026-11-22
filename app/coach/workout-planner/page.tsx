import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import WorkoutPlannerClient from '@/components/coach/workout-planner-client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Client Workout Planner — FitTrack' }

export default async function WorkoutPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string
    edit?: string
    error?: string
    saved?: string
    deleted?: string
  }>
}) {
  const session = await requireCoach()
  const params = await searchParams
  const db: any = createAdminClient()

  // 1. Get coach profile
  const { data: coach } = await db
    .from('coaches')
    .select('id')
    .eq('user_id', session.id)
    .maybeSingle()

  // 2. Fetch only clients assigned to this coach
  const { data: assignments } = coach
    ? await db
        .from('coach_assignments')
        .select('client_id, clients(id, user_id, users(full_name, email))')
        .eq('coach_id', coach.id)
        .is('ended_at', null)
    : { data: [] }

  const clientList = (assignments ?? [])
    .filter((a: any) => a.clients?.id)
    .map((a: any) => {
      const c = a.clients
      const rawName = c.users?.full_name?.trim()
      const email = c.users?.email || ''
      const baseName = (!rawName || rawName === 'false' || rawName === 'null')
        ? (email ? email.split('@')[0] : 'Client')
        : rawName
      return { id: c.id, name: baseName, email }
    })

  const clientIds = clientList.map((c: any) => c.id)

  // 3. Fetch workout plans + exercise library
  const [{ data: rawWorkoutPlans }, { data: exerciseLibrary }] = await Promise.all([
    db
      .from('workout_plans')
      .select('id, client_id, coach_user_id, title, notes, schedule, updated_at, clients(users(full_name))')
      .order('updated_at', { ascending: false }),
    db
      .from('exercise_library')
      .select('id, name, muscle_group, description, video_url')
      .order('name', { ascending: true }),
  ])

  // Filter plans visible to this coach:
  // 1. Client is assigned to this coach
  // 2. Coach is the creator (coach_user_id)
  // 3. Admin explicitly granted access to this coach (in shared_coach_ids or metadata)
  const workoutPlans = (rawWorkoutPlans ?? []).filter((plan: any) => {
    if (clientIds.includes(plan.client_id)) return true
    if (plan.coach_user_id === session.id) return true
    if (Array.isArray(plan.shared_coach_ids) && plan.shared_coach_ids.includes(session.id)) return true
    const shared = plan.schedule?.[0]?.sharedCoachIds
    if (Array.isArray(shared) && shared.includes(session.id)) return true
    return false
  })

  return (
    <WorkoutPlannerClient
      selectedClientId={params.clientId ?? null}
      editId={params.edit ?? null}
      flashError={params.error ?? null}
      flashSaved={params.saved ?? null}
      flashDeleted={params.deleted ?? null}
      clientList={clientList}
      workoutPlans={workoutPlans ?? []}
      exerciseLibrary={exerciseLibrary ?? []}
    />
  )
}
