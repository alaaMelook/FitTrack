import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { RefreshCw, Clock, CheckCircle2, XCircle, UserCheck } from 'lucide-react'
import { ChangeCoachForm } from '@/components/client/change-coach-form'

export const metadata: Metadata = { title: 'Request Coach Change — FitTrack' }

export default async function ClientChangeCoachPage() {
  const session = await requireClient()
  const supabase = await createClient()

  // Get client record
  const { data: clientRow } = await supabase
    .from('clients')
    .select('id, gym_id')
    .eq('user_id', session.id)
    .single()

  const clientId = clientRow?.id

  // Fetch past requests with requested coach name
  const { data: pastRequests } = clientId
    ? await supabase
        .from('coach_change_requests')
        .select(`
          id,
          reason,
          status,
          review_notes,
          created_at,
          requested_coaches:requested_coach_id (
            users ( full_name )
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
    : { data: [] }

  const hasPending = pastRequests?.some((r) => r.status === 'pending') ?? false

  // Fetch all active coaches in the gym
  const { data: coachesData } = clientRow
    ? await supabase
        .from('coaches')
        .select(`
          id,
          users ( full_name )
        `)
        .eq('gym_id', clientRow.gym_id)
        .eq('is_active', true)
    : { data: [] }

  const availableCoaches = (coachesData || []).map((c: any) => ({
    id: c.id,
    name: c.users?.full_name || 'Coach',
  }))

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="badge badge-success">Accepted & Assigned</span>
    if (status === 'rejected') return <span className="badge badge-error">Declined</span>
    return <span className="badge badge-warning">Waiting for Coach Acceptance</span>
  }

  return (
    <div className="page-body animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Change Coach Request</h1>
        <p className="text-secondary text-sm">
          Select a new coach you would like to train with. Your request will be sent to the coach for their acceptance.
        </p>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Form */}
        <div>
          <ChangeCoachForm availableCoaches={availableCoaches} hasPending={hasPending} />
        </div>

        {/* Request History */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Request History
            </h3>

            {!pastRequests || pastRequests.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-icon"><RefreshCw size={24} /></div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No previous change requests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {pastRequests.map((req: any) => {
                  const requestedCoachName = req.requested_coaches?.users?.full_name
                  return (
                    <div
                      key={req.id}
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-elevated)',
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {statusBadge(req.status)}
                      </div>
                      {requestedCoachName && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-700)', fontWeight: 600, marginBottom: 4 }}>
                          Requested Coach: {requestedCoachName}
                        </p>
                      )}
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: req.review_notes ? '0.5rem' : 0 }}>
                        <strong>Reason:</strong> {req.reason}
                      </p>
                      {req.review_notes && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'var(--cream-300)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                          <strong>Coach Note:</strong> {req.review_notes}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
