import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { AddClientMeasurementModal } from '@/components/client/add-client-measurement-modal'
import { ClientProgressTracker, type Measurement } from '@/components/client/client-progress-tracker'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'My Progress & Evolution — FitTrack',
  description: 'Track body metrics, step-by-step delta comparisons, and fitness evolution.',
}

export default async function ClientProgressPage() {
  const session = await requireClient()
  const adminSupabase = createAdminClient()

  const { data: clientRow } = await adminSupabase
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const clientId = clientRow?.id

  const { data: measurements } = clientId
    ? await adminSupabase
        .from('measurements')
        .select('*')
        .eq('client_id', clientId)
        .order('measured_at', { ascending: false })
    : { data: [] }

  return (
    <div className="page-body animate-fade-in">
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
            My Progress & Evolution
          </h1>
          <p className="text-secondary text-sm">
            Track your body metrics, delta evolution between check-ins, and overall fitness transformation.
          </p>
        </div>
        <AddClientMeasurementModal />
      </div>

      <ClientProgressTracker measurements={(measurements as Measurement[]) ?? []} />
    </div>
  )
}
