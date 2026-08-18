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
  Camera,
  CreditCard,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { AddMeasurementModal } from '@/components/coach/add-measurement-modal'

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
        phone,
        avatar_url,
        is_active,
        created_at
      )
    `)
    .eq('id', clientId)
    .single()

  if (!client) notFound()

  const user = (client as any).users

  // Fetch active membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('client_id', clientId)
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch all measurements
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*')
    .eq('client_id', clientId)
    .order('measured_at', { ascending: false })

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CL'

  const latestM = measurements?.[0]
  const prevM = measurements?.[1]
  const weightDiff = latestM && prevM && latestM.weight_kg && prevM.weight_kg
    ? (latestM.weight_kg - prevM.weight_kg).toFixed(1)
    : null

  return (
    <div className="page-body animate-fade-in">
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/coach/my-clients"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={16} /> Back to My Clients
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div
          className="avatar-fallback"
          style={{
            width: 72,
            height: 72,
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
            color: '#fff',
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{user?.full_name}</h1>
            <span className="badge badge-success">Assigned Client</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={14} /> {user?.email}
            </span>
            {user?.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={14} /> {user.phone}
              </span>
            )}
            {client.gender && (
              <span style={{ textTransform: 'capitalize' }}>Gender: {client.gender}</span>
            )}
            {client.height_cm && <span>Height: {client.height_cm} cm</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <AddMeasurementModal clientId={clientId} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{latestM?.weight_kg ? `${latestM.weight_kg} kg` : '—'}</div>
            <div className="stat-label">
              Current Weight {weightDiff && `(${parseFloat(weightDiff) > 0 ? '+' : ''}${weightDiff} kg)`}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#15803d' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{latestM?.body_fat_pct ? `${latestM.body_fat_pct}%` : '—'}</div>
            <div className="stat-label">Body Fat %</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#b45309' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 'var(--text-lg)' }}>
              {membership?.plan_name ?? 'Active Plan'}
            </div>
            <div className="stat-label">
              {membership?.end_date ? `Expires ${new Date(membership.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Membership'}
            </div>
          </div>
        </div>
      </div>

      {/* Measurement History */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} style={{ color: 'var(--brand-600)' }} />
              Measurement Log History
            </h2>
            <p className="text-secondary text-xs">Complete physical measurement records.</p>
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
                  <th>Weight</th>
                  <th>Body Fat</th>
                  <th>Muscle Mass</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hips</th>
                  <th>Arm</th>
                  <th>Thigh</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>{m.weight_kg != null ? `${m.weight_kg} kg` : '—'}</td>
                    <td>{m.body_fat_pct != null ? `${m.body_fat_pct}%` : '—'}</td>
                    <td>{m.muscle_mass_kg != null ? `${m.muscle_mass_kg} kg` : '—'}</td>
                    <td>{m.chest_cm != null ? `${m.chest_cm} cm` : '—'}</td>
                    <td>{m.waist_cm != null ? `${m.waist_cm} cm` : '—'}</td>
                    <td>{m.hips_cm != null ? `${m.hips_cm} cm` : '—'}</td>
                    <td>{m.arm_cm != null ? `${m.arm_cm} cm` : '—'}</td>
                    <td>{m.thigh_cm != null ? `${m.thigh_cm} cm` : '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 220 }} className="truncate" title={m.notes ?? ''}>
                      {m.notes ?? '—'}
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
