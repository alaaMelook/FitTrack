import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  CreditCard,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { AddMeasurementModal } from '@/components/coach/add-measurement-modal'
import { EditMeasurementActions } from '@/components/coach/edit-measurement-actions'

export const metadata: Metadata = { title: 'Client Details — FitTrack' }

export default async function CoachClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: clientId } = await params
  const session = await requireCoach()
  const supabase = await createClient()

  // Fetch coach record to verify assignment
  const { data: coachRow } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', session.id)
    .single()

  if (!coachRow) notFound()

  // Verify coach is assigned to this client
  const { data: assignment } = await supabase
    .from('coach_assignments')
    .select('id, started_at')
    .eq('coach_id', coachRow.id)
    .eq('client_id', clientId)
    .is('ended_at', null)
    .maybeSingle()

  if (!assignment) notFound()

  // Fetch client details
  const { data: client } = await supabase
    .from('clients')
    .select(`
      id,
      date_of_birth,
      gender,
      height_cm,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
      users (
        full_name,
        email,
        phone
      )
    `)
    .eq('id', clientId)
    .single()

  if (!client) notFound()

  // Fetch measurements
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*')
    .eq('client_id', clientId)
    .order('measured_at', { ascending: false })

  // Fetch active membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const user = client.users as any
  const latestM = measurements?.[0]

  // Calculate age if DOB exists
  const age = client.date_of_birth
    ? Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CL'

  return (
    <div className="page-body animate-fade-in">
      {/* Breadcrumb / Back */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/coach/my-clients"
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', paddingLeft: 0 }}
        >
          <ChevronLeft size={16} /> Back to My Clients
        </Link>
      </div>

      {/* Client Profile Header Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              className="avatar-fallback avatar-xl"
              style={{
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                color: '#fff',
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
                {user?.full_name ?? 'Client'}
              </h1>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {user?.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Mail size={12} /> {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={12} /> {user.phone}
                  </span>
                )}
                {client.gender && (
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {client.gender}
                  </span>
                )}
                {age != null && (
                  <span className="badge badge-neutral">{age} yrs old</span>
                )}
                {client.height_cm != null && (
                  <span className="badge badge-neutral">{client.height_cm} cm</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <AddMeasurementModal clientId={clientId} />
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-4" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{latestM?.weight_kg != null ? `${latestM.weight_kg} kg` : '—'}</div>
            <div className="stat-label">Current Weight</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{latestM?.body_fat_pct != null ? `${latestM.body_fat_pct}%` : '—'}</div>
            <div className="stat-label">Body Fat %</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{latestM?.muscle_mass_kg != null ? `${latestM.muscle_mass_kg} kg` : '—'}</div>
            <div className="stat-label">Muscle Mass</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>
              {membership?.plan_name ?? 'Active Plan'}
            </div>
            <div className="stat-label">
              {membership?.end_date ? `Expires ${new Date(membership.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Membership'}
            </div>
          </div>
        </div>
      </div>

      {/* Measurement History with Edit & Delete Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} style={{ color: 'var(--brand-600)' }} />
              Measurement Log History
            </h2>
            <p className="text-secondary text-xs">Complete physical measurement records • Click edit or delete to manage records.</p>
          </div>
          <AddMeasurementModal clientId={clientId} />
        </div>

        {!measurements || measurements.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
            <div className="empty-icon"><Activity size={28} /></div>
            <p style={{ fontWeight: 600 }}>No measurements logged yet</p>
            <p className="text-secondary text-sm">Click &quot;Log Measurement&quot; above to log the first assessment.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chest</th>
                  <th>Arm</th>
                  <th>Glutes</th>
                  <th>Abs</th>
                  <th>Leg</th>
                  <th>Weight</th>
                  <th>Body Fat</th>
                  <th>Muscle Mass</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>{m.chest_cm != null ? `${m.chest_cm} cm` : '—'}</td>
                    <td>{m.arm_cm != null ? `${m.arm_cm} cm` : '—'}</td>
                    <td>{m.hips_cm != null ? `${m.hips_cm} cm` : '—'}</td>
                    <td>{m.waist_cm != null ? `${m.waist_cm} cm` : '—'}</td>
                    <td>{m.thigh_cm != null ? `${m.thigh_cm} cm` : '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-700)' }}>{m.weight_kg != null ? `${m.weight_kg} kg` : '—'}</td>
                    <td>{m.body_fat_pct != null ? `${m.body_fat_pct}%` : '—'}</td>
                    <td>{m.muscle_mass_kg != null ? `${m.muscle_mass_kg} kg` : '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 180 }} className="truncate" title={m.notes ?? ''}>
                      {m.notes ?? '—'}
                    </td>
                    <td>
                      <EditMeasurementActions m={m} clientId={clientId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes / Emergency Contact */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--brand-600)' }} />
            Client Goals & Medical Notes
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: client.notes ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.6 }}>
            {client.notes || 'No special notes recorded.'}
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ color: '#b45309' }} />
            Emergency Contact
          </h3>
          {client.emergency_contact_name ? (
            <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
              <div><strong>Name:</strong> {client.emergency_contact_name}</div>
              {client.emergency_contact_phone && (
                <div><strong>Phone:</strong> {client.emergency_contact_phone}</div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No emergency contact provided.</p>
          )}
        </div>
      </div>
    </div>
  )
}
