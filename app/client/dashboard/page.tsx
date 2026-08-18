import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreditCard, UserCheck, Activity, TrendingUp, FileText, AlertCircle } from 'lucide-react'
import { AddMembershipModal } from '@/components/client/add-membership-modal'
import { AddClientMeasurementModal } from '@/components/client/add-client-measurement-modal'
import { EditClientGoalsModal } from '@/components/client/edit-client-goals-modal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'My Dashboard — FitTrack' }

export default async function ClientDashboardPage() {
  const session = await requireClient()
  const supabase = await createClient()

  // Get client record
  const { data: clientRow } = await supabase
    .from('clients')
    .select('id, notes, emergency_contact_name, emergency_contact_phone')
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

  // Get assigned coach name
  let coachName: string | null = null
  if (clientId) {
    try {
      const adminClient = createAdminClient()
      const { data: aData } = await adminClient
        .from('coach_assignments')
        .select(`
          coaches (
            users ( full_name, email )
          )
        `)
        .eq('client_id', clientId)
        .is('ended_at', null)
        .maybeSingle()
      coachName = (aData?.coaches as any)?.users?.full_name ?? null
    } catch (e) {
      console.error('Error fetching coach name for client dashboard:', e)
    }

    if (!coachName) {
      const { data: aData } = await supabase
        .from('coach_assignments')
        .select(`
          coaches (
            users ( full_name, email )
          )
        `)
        .eq('client_id', clientId)
        .is('ended_at', null)
        .maybeSingle()
      coachName = (aData?.coaches as any)?.users?.full_name ?? null
    }
  }

  // Get latest measurements
  const { data: measurements } = clientId
    ? await supabase
        .from('measurements')
        .select('id, measured_at, weight_kg, body_fat_pct, muscle_mass_kg, notes')
        .eq('client_id', clientId)
        .order('measured_at', { ascending: false })
        .limit(3)
    : { data: [] }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const latestM = measurements?.[0]

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
            Welcome, {session.full_name?.split(' ')[0] ?? 'Member'} 👋
          </h1>
          <p className="text-secondary text-sm">{today}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <AddClientMeasurementModal />
          <AddMembershipModal />
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
        {/* Membership Card */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: isMembershipActive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: isMembershipActive ? '#16a34a' : '#dc2626' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
              {isMembershipActive ? 'Active' : 'Expired'}
            </div>
            <div className="stat-label">
              {membership?.end_date ? `Valid until ${new Date(membership.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No active membership'}
            </div>
          </div>
        </div>

        {/* Assigned Coach Card */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>
              {coachName ?? 'Not Assigned'}
            </div>
            <div className="stat-label">Personal Coach</div>
          </div>
        </div>

        {/* Latest Weight Card */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">
              {latestM?.weight_kg != null ? `${latestM.weight_kg} kg` : '—'}
            </div>
            <div className="stat-label">
              {latestM?.measured_at ? `Latest (${new Date(latestM.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : 'Weight Log'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Measurements & Goals */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Recent Measurements */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={18} style={{ color: 'var(--brand-600)' }} /> Recent Assessments
              </h3>
              <p className="text-secondary text-xs">Your last recorded progress metrics.</p>
            </div>
            <AddClientMeasurementModal />
          </div>

          {!measurements || measurements.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-icon"><Activity size={24} /></div>
              <p style={{ fontWeight: 600 }}>No measurements recorded yet.</p>
              <p className="text-secondary text-xs" style={{ marginBottom: '1rem' }}>Log your assessment data to start tracking evolution.</p>
              <AddClientMeasurementModal />
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Body Fat</th>
                    <th>Muscle Mass</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                        {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-700)' }}>
                        {m.weight_kg != null ? `${m.weight_kg} kg` : '—'}
                      </td>
                      <td>{m.body_fat_pct != null ? `${m.body_fat_pct}%` : '—'}</td>
                      <td>{m.muscle_mass_kg != null ? `${m.muscle_mass_kg} kg` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Goals & Medical Notes Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={18} style={{ color: 'var(--brand-600)' }} /> My Goals & Medical Notes
              </h3>
              <EditClientGoalsModal
                initialNotes={clientRow?.notes ?? null}
              />
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Fitness Goals & Health Remarks
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: clientRow?.notes ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {clientRow?.notes || 'No goals or medical notes recorded yet. Click "Edit Goals & Notes" to add your fitness targets, health remarks, or injury notes.'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
            <EditClientGoalsModal
              initialNotes={clientRow?.notes ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
