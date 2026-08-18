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
        .select('id, start_date, end_date, plan_name')
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
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Membership</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {membership ? (
                <span className={isMembershipActive ? 'badge badge-success' : 'badge badge-error'}>
                  {isMembershipActive ? 'Active' : 'Expired'}
                </span>
              ) : (
                <span className="badge badge-neutral">No Membership</span>
              )}
              {membership?.plan_name && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {membership.plan_name}
                </span>
              )}
            </div>
            {membership?.end_date && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Expires {new Date(membership.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>My Coach</div>
            {coachName ? (
              <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{coachName}</div>
            ) : (
              <span className="badge badge-neutral">Not Assigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Measurements + Photos */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>

        {/* Recent Measurements */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--brand-600)' }} />
              Recent Measurements
            </h2>
            <AddClientMeasurementModal />
          </div>

          {!measurements || measurements.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-icon"><TrendingUp size={24} /></div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No measurements recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {measurements.map((m) => (
                <div key={m.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3) var(--space-4)',
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {m.notes && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }} className="truncate">
                        {m.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', textAlign: 'right' }}>
                    {m.weight_kg != null && (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{m.weight_kg} kg</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Weight</div>
                      </div>
                    )}
                    {m.body_fat_pct != null && (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{m.body_fat_pct}%</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Body Fat</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Photos placeholder */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} style={{ color: 'var(--brand-600)' }} />
              Progress Photos
            </h2>
          </div>
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-icon"><Camera size={24} /></div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No photos uploaded yet.</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Your coach will upload progress photos here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
