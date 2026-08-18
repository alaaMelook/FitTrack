import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { CreditCard, UserCheck, Activity, Camera, TrendingUp } from 'lucide-react'
import { AddMembershipModal } from '@/components/client/add-membership-modal'
import { AddClientMeasurementModal } from '@/components/client/add-client-measurement-modal'

export const metadata: Metadata = { title: 'My Dashboard — FitTrack' }

export default async function ClientDashboardPage() {
  const session = await requireClient()
  const supabase = await createClient()

  // Get client record
  const { data: clientRow } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const clientId = clientRow?.id

  // Get latest membership
  const { data: membership } = clientId
    ? await supabase
        .from('memberships')
        .select('id, start_date, end_date')
        .eq('client_id', clientId)
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  // Derive status
  const now = new Date().toISOString().split('T')[0]
  const isMembershipActive = membership ? membership.end_date >= now : false

  // Get assigned coach
  const { data: assignment } = clientId
    ? await supabase
        .from('coach_assignments')
        .select(`
          coaches (
            users ( full_name, email )
          )
        `)
        .eq('client_id', clientId)
        .is('ended_at', null)
        .maybeSingle()
    : { data: null }

  const coachName = (assignment?.coaches as any)?.users?.full_name

  // Get latest 3 measurements
  const { data: measurements } = clientId
    ? await supabase
        .from('measurements')
        .select('id, measured_at, weight_kg, body_fat_pct, notes')
        .eq('client_id', clientId)
        .order('measured_at', { ascending: false })
        .limit(3)
    : { data: [] }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="page-body animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            {today}
          </p>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
            Welcome, {session.full_name.split(' ')[0]} 🏋️
          </h1>
          <p className="text-secondary text-sm">Track your fitness journey and progress.</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <AddMembershipModal />
          <AddClientMeasurementModal />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
        {/* Membership */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Membership Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {membership ? (
                <span className={isMembershipActive ? 'badge badge-success' : 'badge badge-error'}>
                  {isMembershipActive ? 'Active' : 'Expired'}
                </span>
              ) : (
                <span className="badge badge-neutral">No Membership</span>
              )}
            </div>
            {membership?.end_date && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Expires: <strong>{new Date(membership.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
            )}
          </div>
        </div>

        {/* My Coach */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#15803d' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: '0.25rem' }}>My Personal Coach</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
              {coachName ?? 'No coach assigned'}
            </div>
            <p className="text-secondary text-xs" style={{ marginTop: '0.25rem' }}>
              {coachName ? 'Assigned and tracking your progress' : 'Visit Change Coach to select one'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Measurements */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Recent Progress Logs</h2>
        </div>

        {!measurements || measurements.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-10) var(--space-8)' }}>
            <div className="empty-icon"><Activity size={28} /></div>
            <p style={{ fontWeight: 600 }}>No measurements logged yet</p>
            <p className="text-secondary text-sm">Click &quot;Log Measurement&quot; to start recording your progress.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Body Fat</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>{m.weight_kg ? `${m.weight_kg} kg` : '—'}</td>
                    <td>{m.body_fat_pct ? `${m.body_fat_pct}%` : '—'}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
