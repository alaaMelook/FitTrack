import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Camera, Activity } from 'lucide-react'
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

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Measurements */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} style={{ color: 'var(--brand-600)' }} />
              Measurement History
            </h2>
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
                    <th>Weight</th>
                    <th>Body Fat</th>
                    <th>Waist</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                        {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 700 }}>{m.weight_kg != null ? `${m.weight_kg} kg` : '—'}</td>
                      <td>{m.body_fat_pct != null ? `${m.body_fat_pct}%` : '—'}</td>
                      <td>{m.waist_cm != null ? `${m.waist_cm} cm` : '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 180 }} className="truncate" title={m.notes ?? ''}>
                        {m.notes ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Progress Photos */}
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} style={{ color: 'var(--brand-600)' }} />
            Progress Photos
          </h2>
          <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
            <div className="empty-icon"><Camera size={28} /></div>
            <p style={{ fontWeight: 600 }}>No photos uploaded yet</p>
            <p className="text-secondary text-sm">Your coach will upload progress photos here during your assessments.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
