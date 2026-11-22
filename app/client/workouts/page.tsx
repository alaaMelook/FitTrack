import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { WorkoutPlanView } from '@/components/programs/program-views'
import { Dumbbell } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My Workout Schedule — FitTrack' }

export default async function ClientWorkoutsPage() {
  const session = await requireClient()
  const db: any = createAdminClient()

  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .maybeSingle()

  const { data: plans } = client
    ? await db
        .from('workout_plans')
        .select('id, title, notes, schedule, updated_at')
        .eq('client_id', client.id)
        .order('updated_at', { ascending: false })
    : { data: [] }

  return (
    <main className="page-body animate-fade-in">
      <header
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
            flexShrink: 0,
          }}
        >
          <Dumbbell size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Workout Schedule
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
            Your personalized training routines, assigned exercises, sets, reps, and coach instructions.
          </p>
        </div>
      </header>

      <WorkoutPlanView plans={plans ?? []} />
    </main>
  )
}
