import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import CoachProgramsTabs from '@/components/coach/coach-programs-tabs'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Nutrition & Workout Plans — FitTrack' }

export default async function CoachProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    error?: string
    saved?: string
    deleted?: string
    edit?: string
    q?: string
  }>
}) {
  const session = await requireCoach()
  const params = await searchParams
  const db: any = createAdminClient()

  // 1. Get coach profile
  const { data: coach } = await db.from('coaches').select('id').eq('user_id', session.id).maybeSingle()

  // 2. Get coach's assigned clients
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

  // 3. Fetch nutrition plans, workout plans, and exercise library
  const [{ data: nutritionPlans }, { data: workoutPlans }, { data: exerciseLibrary }] = await Promise.all([
    clientIds.length > 0
      ? db
          .from('nutrition_plans')
          .select('id, client_id, title, notes, meals, updated_at, clients(users(full_name))')
          .in('client_id', clientIds)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] }),
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
    <main className="page-body animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Nutrition & Workout Management</h1>
        <p className="text-secondary text-sm">
          Create, customize, and assign personalized meal & training schedules for your assigned clients.
        </p>
      </header>

      {/* Flash Messages */}
      {params.error && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          {params.error}
        </div>
      )}
      {params.saved && (
        <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          ✓ Plan saved successfully.
        </div>
      )}
      {params.deleted && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef3c7', color: '#92400e', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          Plan deleted.
        </div>
      )}

      {/* Warning if no assigned clients */}
      {clientList.length === 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--cream-300)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            You do not currently have any active assigned clients. Clients must be assigned to you by an admin before you can assign plans.
          </p>
        </div>
      )}

      {/* Tabs Container */}
      <CoachProgramsTabs
        initialTab={params.tab}
        editId={params.edit}
        searchQuery={params.q}
        clientList={clientList}
        nutritionPlans={nutritionPlans ?? []}
        workoutPlans={workoutPlans ?? []}
        exerciseLibrary={exerciseLibrary ?? []}
      />
    </main>
  )
}
