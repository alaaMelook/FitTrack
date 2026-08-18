import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, Phone, User } from 'lucide-react'
import { CoachRequestActions } from '@/components/coach/coach-request-actions'

export const metadata: Metadata = { title: 'Client Requests — FitTrack' }

export default async function CoachRequestsPage() {
  const session = await requireCoach()
  const supabase = await createClient()

  // Get coach record
  const { data: coachRow } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const coachId = coachRow?.id

  // Fetch all requests directed to this coach
  const { data: requests } = coachId
    ? await supabase
        .from('coach_change_requests')
        .select(`
          id,
          reason,
          status,
          review_notes,
          created_at,
          clients (
            id,
            gender,
            height_cm,
            users (
              full_name,
              email,
              phone
            )
          ),
          current_coaches:current_coach_id (
            users (
              full_name
            )
          )
        `)
        .eq('requested_coach_id', coachId)
        .order('created_at', { ascending: false })
    : { data: [] }

  const pendingRequests = requests?.filter((r) => r.status === 'pending') ?? []
  const pastRequests = requests?.filter((r) => r.status !== 'pending') ?? []

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Client Requests</h1>
        <p className="text-secondary text-sm">
          Review and accept clients who have requested you as their personal trainer.
        </p>
      </div>

      {/* Pending Requests Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Pending Requests</h2>
          <span className={pendingRequests.length > 0 ? 'badge badge-warning' : 'badge badge-neutral'}>
            {pendingRequests.length} Waiting
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-10) var(--space-8)' }}>
            <div className="empty-icon"><UserCheck size={28} /></div>
            <p style={{ fontWeight: 600 }}>No pending client requests</p>
            <p className="text-secondary text-sm">When clients request you as their coach, their requests will appear here for your acceptance.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {pendingRequests.map((req: any) => {
              const client = req.clients
              const user = client?.users
              const currentCoachName = (req.current_coaches as any)?.users?.full_name
              const initials = user?.full_name
                ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'CL'

              return (
                <div
                  key={req.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                    border: '1.5px solid var(--border-brand)',
                    background: '#ffffff',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div
                        className="avatar-fallback avatar-lg"
                        style={{
                          background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                          color: '#fff',
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
                          {user?.full_name ?? 'Client'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {user?.email} {user?.phone ? `• ${user.phone}` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {client?.gender && <span>Gender: <strong style={{ textTransform: 'capitalize' }}>{client.gender}</strong></span>}
                          {client?.height_cm && <span>Height: <strong>{client.height_cm} cm</strong></span>}
                          {currentCoachName && <span>Previous Coach: <strong>{currentCoachName}</strong></span>}
                        </div>
                      </div>
                    </div>

                    <CoachRequestActions requestId={req.id} clientName={user?.full_name ?? 'Client'} />
                  </div>

                  {/* Reason */}
                  <div
                    style={{
                      background: 'var(--cream-300)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    <strong>Client Note / Reason:</strong> {req.reason || 'No specific note provided.'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Request History */}
      <div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1.25rem' }}>
          Request History
        </h2>

        {pastRequests.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No past request history.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {pastRequests.map((req: any) => {
              const user = req.clients?.users
              return (
                <div
                  key={req.id}
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {user?.full_name ?? 'Client'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {req.reason}
                    </div>
                  </div>

                  <span className={req.status === 'approved' ? 'badge badge-success' : 'badge badge-error'}>
                    {req.status === 'approved' ? 'Accepted' : 'Declined'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
