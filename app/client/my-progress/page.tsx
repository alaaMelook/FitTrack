import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Activity } from 'lucide-react'
import { AddClientMeasurementModal } from '@/components/client/add-client-measurement-modal'

export const metadata: Metadata = { title: 'My Progress — FitTrack' }

export default async function ClientProgressPage() {
  const session = await requireClient()
  const supabase = await createClient()

  const { data: clientRow } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const clientId = clientRow?.id

  const { data: measurements } = clientId
    ? await supabase
        .from('measurements')
        .select('*')
        .eq('client_id', clientId)
        .order('measured_at', { ascending: false })
    : { data: [] }

  return (
    <div className="page-body animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>My Progress & Measurements</h1>
          <p className="text-secondary text-sm">Track your body metrics and physical evolution.</p>
        </div>
        <AddClientMeasurementModal />
      </div>

      {/* Measurements Card — Full Width */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} style={{ color: 'var(--brand-600)' }} />
              Measurement History
            </h2>
            <p className="text-secondary text-xs">All recorded assessments in chronological order.</p>
          </div>
          <AddClientMeasurementModal />
        </div>

        {!measurements || measurements.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
            <div className="empty-icon"><TrendingUp size={28} /></div>
            <p style={{ fontWeight: 600 }}>No measurements yet</p>
            <p className="text-secondary text-sm" style={{ marginBottom: '1.25rem' }}>Click &quot;Log Measurement&quot; to add your first weight and body metrics.</p>
            <AddClientMeasurementModal />
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
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>
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
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200 }} className="truncate" title={m.notes ?? ''}>
                      {m.notes ?? '—'}
                    </td>
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
