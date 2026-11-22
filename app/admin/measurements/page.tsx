import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { Ruler, Plus, Trash2, Users } from 'lucide-react'
import { adminAddMeasurement, adminDeleteMeasurement } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Client Measurements — FitTrack' }

function fmt(val: number | null | undefined, unit = '') {
  if (val == null) return '—'
  return `${val}${unit}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminMeasurementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string
    from?: string
    to?: string
    action?: string
    saved?: string
    deleted?: string
  }>
}) {
  await requireAdmin()
  const db: any = createAdminClient()

  const sp = await searchParams
  const clientId = sp.clientId || ''
  const from = sp.from || ''
  const to = sp.to || ''
  const action = sp.action || ''
  const saved = sp.saved === '1'
  const deleted = sp.deleted === '1'

  // Fetch all clients for dropdown
  const { data: clients } = await db
    .from('clients')
    .select('id, users(full_name, email)')
    .order('created_at', { ascending: false })

  // Fetch measurements
  let query = db
    .from('measurements')
    .select('*, clients(users(full_name))')
    .order('measured_at', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)
  if (from) query = query.gte('measured_at', from)
  if (to) query = query.lte('measured_at', to + 'T23:59:59')

  const { data: measurements } = await query

  // Stats
  const allClientIds = new Set((measurements ?? []).map((m: any) => m.client_id))
  const totalClients = allClientIds.size
  const totalRecords = measurements?.length ?? 0
  const mostRecent = measurements?.[0]?.measured_at ?? null

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonthClientIds = new Set(
    (measurements ?? [])
      .filter((m: any) => m.measured_at >= monthStart)
      .map((m: any) => m.client_id),
  )
  const measuredThisMonth = thisMonthClientIds.size

  const hasFilters = !!(clientId || from || to)

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ruler size={28} style={{ color: 'var(--brand-600)' }} />
            Client Measurements
          </h1>
          <p className="text-secondary text-sm">View and manage body measurement records across all clients.</p>
        </div>
        <Link
          href={action === 'add' ? '/admin/measurements' : '/admin/measurements?action=add'}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          {action === 'add' ? 'Cancel' : 'Add Measurement'}
        </Link>
      </div>

      {/* Toast banners */}
      {saved && (
        <div className="badge badge-brand" style={{ marginBottom: '1rem', padding: '8px 14px', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
          ✓ Measurement saved successfully.
        </div>
      )}
      {deleted && (
        <div className="badge badge-error" style={{ marginBottom: '1rem', padding: '8px 14px', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
          Measurement deleted.
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Clients with Measurements</div>
          <div className="stat-value">{totalClients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{totalRecords}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Most Recent</div>
          <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>{fmtDate(mostRecent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clients Measured This Month</div>
          <div className="stat-value">{measuredThisMonth}</div>
        </div>
      </div>

      {/* Add Measurement Form */}
      {action === 'add' && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: 'var(--space-6)' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: 'var(--text-lg)', fontWeight: 700 }}>New Measurement</h2>
          <form action={adminAddMeasurement}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Client *</label>
                <select name="clientId" required>
                  <option value="">— Select client —</option>
                  {(clients ?? []).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.users?.full_name ?? c.users?.email ?? c.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" name="measuredAt" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" step="0.1" name="weight_kg" placeholder="e.g. 75.5" />
              </div>
              <div className="form-group">
                <label>Body Fat (%)</label>
                <input type="number" step="0.1" name="body_fat_pct" placeholder="e.g. 18.2" />
              </div>
              <div className="form-group">
                <label>Muscle Mass (kg)</label>
                <input type="number" step="0.1" name="muscle_mass_kg" placeholder="e.g. 38.0" />
              </div>
              <div className="form-group">
                <label>Chest (cm)</label>
                <input type="number" step="0.1" name="chest_cm" />
              </div>
              <div className="form-group">
                <label>Arm (cm)</label>
                <input type="number" step="0.1" name="arm_cm" />
              </div>
              <div className="form-group">
                <label>Waist (cm)</label>
                <input type="number" step="0.1" name="waist_cm" />
              </div>
              <div className="form-group">
                <label>Hips/Glutes (cm)</label>
                <input type="number" step="0.1" name="hips_cm" />
              </div>
              <div className="form-group">
                <label>Thigh (cm)</label>
                <input type="number" step="0.1" name="thigh_cm" />
              </div>
              <div className="form-group">
                <label>Upper Abs (cm)</label>
                <input type="number" step="0.1" name="upper_abs_cm" placeholder="e.g. 74.0" />
              </div>
              <div className="form-group">
                <label>Lower Abs (cm)</label>
                <input type="number" step="0.1" name="lower_abs_cm" placeholder="e.g. 78.0" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea name="notes" rows={2} placeholder="Optional notes…" />
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary">Save Measurement</button>
              <Link href="/admin/measurements" className="btn btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: 'var(--space-4) var(--space-5)' }}>
        <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, minWidth: 200 }}>
            <label style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>Filter by Client</label>
            <select name="clientId" defaultValue={clientId}>
              <option value="">All clients</option>
              {(clients ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.users?.full_name ?? c.users?.email ?? c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>From</label>
            <input type="date" name="from" defaultValue={from} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>To</label>
            <input type="date" name="to" defaultValue={to} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: 38 }}>Apply</button>
          {hasFilters && (
            <Link href="/admin/measurements" className="btn btn-ghost" style={{ height: 38 }}>
              Clear filters
            </Link>
          )}
        </form>
      </div>

      {/* Measurements Table */}
      {!measurements || measurements.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="empty-icon"><Users size={28} /></div>
          <p style={{ fontWeight: 600, marginTop: 'var(--space-3)' }}>No measurements found</p>
          <p className="text-secondary text-sm">
            {hasFilters ? 'Try adjusting your filters.' : 'Add a measurement to get started.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 1100 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Weight</th>
                <th>Body Fat%</th>
                <th>Muscle Mass</th>
                <th>Chest</th>
                <th>Arm</th>
                <th>Upper Abs</th>
                <th>Lower Abs</th>
                <th>Hips/Glutes</th>
                <th>Thigh</th>
                <th>Notes</th>
                <th>Recorded By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m: any) => {
                const clientName = m.clients?.users?.full_name ?? '—'
                return (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-sm)' }}>
                      <span className="badge badge-brand" style={{ fontWeight: 600, fontSize: 11 }}>
                        {fmtDate(m.measured_at)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>{clientName}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.weight_kg, ' kg')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.body_fat_pct, '%')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.muscle_mass_kg, ' kg')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.chest_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.arm_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.upper_abs_cm ?? m.waist_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.lower_abs_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.hips_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{fmt(m.thigh_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.notes || '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {m.recorded_by_user_id ? 'Admin' : '—'}
                    </td>
                    <td>
                      <form action={adminDeleteMeasurement}>
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          className="btn btn-ghost"
                          style={{ color: 'var(--error)', padding: '4px 8px' }}
                          title="Delete measurement"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
