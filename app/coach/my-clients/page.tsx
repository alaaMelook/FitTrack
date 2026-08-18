import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { CoachClientsSearch } from '@/components/coach/coach-clients-search'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'My Clients — FitTrack' }

export default async function CoachMyClientsPage() {
  const session = await requireCoach()
  const supabase = await createClient()

  const { data: coachRow } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const { data: assignments } = coachRow
    ? await supabase
        .from('coach_assignments')
        .select(`
          id,
          started_at,
          clients (
            id,
            user_id,
            date_of_birth,
            gender,
            height_cm,
            users ( full_name, email, phone )
          )
        `)
        .eq('coach_id', coachRow.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
    : { data: [] }

  const formattedClients = (assignments || []).map((a: any) => ({
    assignmentId: a.id,
    startedAt: a.started_at,
    client: a.clients,
  }))

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>My Clients</h1>
          <p className="text-secondary text-sm">
            {formattedClients.length} client{formattedClients.length !== 1 ? 's' : ''} currently assigned to you • Search by name or phone
          </p>
        </div>
      </div>

      <CoachClientsSearch clients={formattedClients} />
    </div>
  )
}
