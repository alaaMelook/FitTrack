import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Mail, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { InviteForm } from '@/components/admin/invite-form'

export const metadata: Metadata = { title: 'Invitations — FitTrack' }

export default async function AdminInvitationsPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  // Fetch all invitations
  const { data: invitations } = await supabase
    .from('client_invitations')
    .select('*')
    .order('created_at', { ascending: false })

  const statusBadge = (status: string) => {
    if (status === 'accepted') return <span className="badge badge-success">Accepted</span>
    if (status === 'expired') return <span className="badge badge-error">Expired</span>
    if (status === 'cancelled') return <span className="badge badge-neutral">Cancelled</span>
    return <span className="badge badge-warning">Pending</span>
  }

  return (
    <div className="page-body animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Coach Invitations</h1>
        <p className="text-secondary text-sm">
          Send invitation links to new coaches. Clients can self-register from the sign-up page.
        </p>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Form */}
        <div>
          <InviteForm />
        </div>

        {/* History */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Invitation Log
            </h3>

            {!invitations || invitations.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-icon"><Mail size={24} /></div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No invitations sent yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{inv.email}</span>
                      {statusBadge(inv.status)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      <span style={{ textTransform: 'capitalize' }}>Role: {inv.role}</span>
                      <span>Expires: {new Date(inv.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
