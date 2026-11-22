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

  // 2. Get assigned clients
  const { data: assignments } = coach
    ? await db
        .from('coach_assignments')
        .select('client_id, clients(id, users(full_name, email))')
        .eq('coach_id', coach.id)
        .is('ended_at', null)
    : { data: [] }

  const clientList = (assignments ?? [])
    .map((a: any) => ({
      id: a.clients?.id,
      name: a.clients?.users?.full_name || 'Client',
      email: a.clients?.users?.email || '',
    }))
    .filter((c: any) => Boolean(c.id))

  const clientIds = clientList.map((c: any) => c.id)

  // 3. Fetch workout plans + exercise library
  const [{ data: workoutPlans }, { data: exerciseLibrary }] = await Promise.all([
    clientIds.length > 0
      ? db
          .from('workout_plans')
          .select('id, client_id, title, notes, schedule, updated_at, clients(users(full_name))')
          .in('client_id', clientIds)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    db
      .from('exercise_library')
      .select('id, name, muscle_group, description, video_url')
      .order('name', { ascending: true }),
  ])

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
