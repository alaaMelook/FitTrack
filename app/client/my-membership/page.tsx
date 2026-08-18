import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { AddMembershipModal } from '@/components/client/add-membership-modal'

export const metadata: Metadata = { title: 'My Membership — FitTrack' }

export default async function ClientMembershipPage() {
  const session = await requireClient()
  const supabase = await createClient()

  const { data: clientRow } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const { data: memberships } = clientRow
    ? await supabase
        .from('memberships')
        .select('*')
        .eq('client_id', clientRow.id)
        .order('start_date', { ascending: false })
    : { data: [] }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page-body animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>My Membership</h1>
          <p className="text-secondary text-sm">View your membership history and current status.</p>
        </div>
        <AddMembershipModal />
      </div>

      {!memberships || memberships.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><CreditCard size={28} /></div>
          <p style={{ fontWeight: 600 }}>No membership records</p>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.25rem' }}>Choose a membership plan to activate your gym access.</p>
          <AddMembershipModal />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {memberships.map((m) => {
            const isActive = m.end_date >= today
            return (
              <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: isActive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isActive ? (
                    <CheckCircle size={18} style={{ color: 'var(--status-success-text)' }} />
                  ) : (
                    <XCircle size={18} style={{ color: 'var(--status-error-text)' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{m.plan_name ?? 'Standard Plan'}</span>
                    <span className={isActive ? 'badge badge-success' : 'badge badge-error'}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      Start: {new Date(m.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      End: {new Date(m.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {m.price_paid != null && (
                      <span style={{ fontWeight: 600, color: 'var(--brand-700)' }}>
                        {m.price_paid} {m.currency ?? 'EGP'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
