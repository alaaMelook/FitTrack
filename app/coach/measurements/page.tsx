import type { Metadata } from 'next'
import Link from 'next/link'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { Ruler, Activity, Users, Calendar, ArrowRight, User } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Client Measurements — FitTrack' }

function fmt(val: number | null | undefined, unit = '') {
  if (val == null) return '—'
  return `${val}${unit}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function CoachMeasurementsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const session = await requireCoach()
  const { clientId } = await searchParams
  const db: any = createAdminClient()

  // 1. Get coach profile
  const { data: coach } = await db.from('coaches').select('id').eq('user_id', session.id).maybeSingle()

  // 2. Get active assigned clients
  const { data: assignments } = coach
    ? await db
        .from('coach_assignments')
        .select('client_id, clients(id, users(full_name, email))')
        .eq('coach_id', coach.id)
        .is('ended_at', null)
    : { data: [] }

  const clients = (assignments ?? [])
    .map((a: any) => ({
      id: a.clients?.id,
      name: a.clients?.users?.full_name || 'Client',
      email: a.clients?.users?.email || '',
    }))
    .filter((c: any) => Boolean(c.id))

  const clientIds = clients.map((c: any) => c.id)

  // 3. Fetch measurements for assigned clients
  let query = db
    .from('measurements')
    .select('*, clients(id, users(full_name))')
    .order('measured_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  } else if (clientIds.length > 0) {
    query = query.in('client_id', clientIds)
  }

  const { data: measurements } = clientIds.length > 0 ? await query : { data: [] }

  // Stats
  const trackedClientCount = new Set((measurements ?? []).map((m: any) => m.client_id)).size
  const totalRecords = measurements?.length ?? 0
  const latestDate = measurements?.[0]?.measured_at ?? null

  return (
    <main className="page-body animate-fade-in">
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Client Measurements</h1>
        <p className="text-secondary text-sm">
          Track and assess physical metrics, body composition, and circumferential progress of your assigned clients.
        </p>
      </header>

      {/* Stat Cards */}
      <div className="stat-grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Assigned Clients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{trackedClientCount}</div>
            <div className="stat-label">Clients with Logs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
            <Ruler size={20} />
          </div>
          <div>
            <div className="stat-value">{totalRecords}</div>
            <div className="stat-label">Total Check-Ins</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>{fmtDate(latestDate)}</div>
            <div className="stat-label">Latest Check-In</div>
          </div>
        </div>
      </div>

      {/* Filter by Client */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: 'var(--space-3) var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              FILTER BY CLIENT:
            </span>
            <Link
              href="/coach/measurements"
              className={`btn btn-sm ${!clientId ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              All Clients ({clients.length})
            </Link>
            {clients.map((c: any) => (
              <Link
                key={c.id}
                href={`/coach/measurements?clientId=${c.id}`}
                className={`btn btn-sm ${clientId === c.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {clientId && (
            <Link
              href={`/coach/my-clients/${clientId}`}
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--brand-600)', fontSize: '12px' }}
            >
              <User size={13} /> Open Full Client Profile & Log <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* Measurements Table */}
      <div className="card">
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ruler size={18} style={{ color: 'var(--brand-600)' }} />
          Measurement Log History
        </h2>

        {(!measurements || measurements.length === 0) ? (
          <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            No measurements recorded yet for the selected filter.
            <div style={{ marginTop: '0.75rem' }}>
              <Link href="/coach/my-clients" className="btn btn-primary btn-sm">
                Go to My Clients to Log
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Weight</th>
                  <th>Body Fat</th>
                  <th>Muscle</th>
                  <th>Chest</th>
                  <th>Arm</th>
                  <th>Waist (Abs)</th>
                  <th>Hips (Glutes)</th>
                  <th>Thigh</th>
                  <th>Upper Body</th>
                  <th>Lower Body</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m: any) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtDate(m.measured_at)}</td>
                    <td style={{ fontWeight: 600 }}>{m.clients?.users?.full_name || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-700)' }}>{fmt(m.weight_kg, ' kg')}</td>
                    <td>{fmt(m.body_fat_pct, '%')}</td>
                    <td>{fmt(m.muscle_mass_kg, ' kg')}</td>
                    <td>{fmt(m.chest_cm, ' cm')}</td>
                    <td>{fmt(m.arm_cm, ' cm')}</td>
                    <td>{fmt(m.waist_cm, ' cm')}</td>
                    <td>{fmt(m.hips_cm, ' cm')}</td>
                    <td>{fmt(m.thigh_cm, ' cm')}</td>
                    <td>{fmt(m.upper_body_cm, ' cm')}</td>
                    <td>{fmt(m.lower_body_cm, ' cm')}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 160 }} className="truncate" title={m.notes ?? ''}>
                      {m.notes || '—'}
                    </td>
                    <td>
                      <Link
                        href={`/coach/my-clients/${m.client_id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
