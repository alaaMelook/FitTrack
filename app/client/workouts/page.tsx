import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { WorkoutPlanView } from '@/components/programs/program-views'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My Workouts — FitTrack' }
export default async function ClientWorkoutsPage() { const session = await requireClient(); const db: any = createAdminClient(); const { data: client } = await db.from('clients').select('id').eq('user_id', session.id).maybeSingle(); const { data: plans } = client ? await db.from('workout_plans').select('id,title,notes,schedule,updated_at').eq('client_id', client.id).order('updated_at', { ascending: false }) : { data: [] }; return <main className="page-body animate-fade-in"><header style={{ marginBottom: 'var(--space-6)' }}><h1 style={{ fontSize: 'var(--text-3xl)' }}>My Workout Plan</h1><p className="text-secondary">Your weekly schedule, exercises, sets, reps, and Captain&apos;s notes.</p></header><WorkoutPlanView plans={plans ?? []} /></main> }
