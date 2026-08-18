import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Users, Activity, TrendingUp, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { AddMeasurementModal } from '@/components/coach/add-measurement-modal'

export const metadata: Metadata = { title: 'Coach Dashboard — FitTrack' }

export default async function CoachDashboardPage() {
  const session = await requireCoach()
  const supabase = await createClient()

  // Fetch this coach's record
  const { data: coachRow } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const coachId = coachRow?.id

  // Fetch active assigned clients
  const { data: assignments } = coachId
    ? await supabase
        .from('coach_assignments')
        .select(`
          id,
          started_at,
          clients (
            id,
            user_id,
            users ( full_name, email, avatar_url )
          )
        `)
        .eq('coach_id', coachId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
    : { data: [] }

  const clientCount = assignments?.length ?? 0

  // Fetch recent measurements count (this month)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const clientIds = assignments?.map((a) => (a.clients as any)?.id).filter(Boolean) ?? []

  const { count: measurementsThisMonth } = clientIds.length
    ? await supabase
        .from('measurements')
        .select('id', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .gte('measured_at', startOfMonth.toISOString())
    : { count: 0 }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="page-body animate-fade-in">

      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          {today}
        </p>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
          Welcome back, {session.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-secondary text-sm">
          Here&apos;s an overview of your clients and their progress.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="stat-value">{clientCount}</div>
            <div className="stat-label">Active Clients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#15803d' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-value">{measurementsThisMonth ?? 0}</div>
            <div className="stat-label">Measurements This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#b45309' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-value">—</div>
            <div className="stat-label">Avg Progress Rate</div>
          </div>
        </div>
      </div>

      {/* My Clients */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>My Clients</h2>
          <Link href="/coach/my-clients" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-600)' }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {!assignments || assignments.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-10) var(--space-8)' }}>
            <div className="empty-icon">
              <Users size={28} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No clients assigned yet</p>
            <p className="text-secondary text-sm">Your assigned clients will appear here once the admin assigns them to you.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {assignments.slice(0, 5).map((a) => {
              const client = a.clients as any
              const user = client?.users
              const initials = user?.full_name
                ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'CL'
              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    background: '#fff',
                  }}
                >
                  <Link
                    href={`/coach/my-clients/${client?.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      flex: 1,
                      minWidth: 0,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div className="avatar-fallback avatar-md" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }} className="truncate">{user?.full_name ?? '—'}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">{user?.email ?? '—'}</div>
                    </div>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <AddMeasurementModal clientId={client?.id} />
                    <Link
                      href={`/coach/my-clients/${client?.id}`}
                      className="btn btn-ghost btn-icon"
                      style={{ color: 'var(--text-muted)' }}
                      title="View Profile"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
