import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { RequestActions } from '@/components/admin/request-actions'

export const metadata: Metadata = { title: 'Coach Requests — FitTrack' }

export default async function AdminChangeRequestsPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  // Fetch all change requests
  const { data: requests } = await supabase
    .from('coach_change_requests')
    .select(`
      id,
      client_id,
      current_coach_id,
      requested_coach_id,
      reason,
      status,
      review_notes,
      created_at,
      clients (
        users ( full_name, email )
      ),
      coaches!coach_change_requests_current_coach_id_fkey (
        users ( full_name )
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch all coaches for reassignment dropdown
  const { data: coachesData } = await supabase
    .from('coaches')
    .select(`
      id,
      users ( full_name )
    `)
    .eq('is_active', true)

  const availableCoaches = (coachesData || []).map((c: any) => ({
    id: c.id,
    name: c.users?.full_name || 'Coach',
  }))

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="badge badge-success">Approved</span>
    if (status === 'rejected') return <span className="badge badge-error">Rejected</span>
    return <span className="badge badge-warning">Pending</span>
  }

  return (
    <div className="page-body animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Coach Change Requests</h1>
        <p className="text-secondary text-sm">
          Review and approve client reassignment requests.
        </p>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><RefreshCw size={28} /></div>
          <p style={{ fontWeight: 600 }}>No change requests submitted yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {requests.map((req: any) => {
            const clientUser = req.clients?.users
            const currentCoachUser = req.coaches?.users

            return (
              <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
                      {clientUser?.full_name ?? 'Client'}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 8 }}>
                      ({clientUser?.email})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {statusBadge(req.status)}
                  </div>
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <strong>Current Coach:</strong> {currentCoachUser?.full_name ?? 'Assigned Coach'}
                </div>

                <div style={{ background: 'var(--cream-300)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                  <strong>Client Reason:</strong> &quot;{req.reason}&quot;
                </div>

                {req.status === 'pending' ? (
                  <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <RequestActions
                      requestId={req.id}
                      requestedCoachId={req.requested_coach_id}
                      availableCoaches={availableCoaches}
                    />
                  </div>
                ) : (
                  req.review_notes && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      <strong>Resolution Note:</strong> {req.review_notes}
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
