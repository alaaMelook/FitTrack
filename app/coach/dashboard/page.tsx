import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Users, Activity, UserCheck, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AddMeasurementModal } from '@/components/coach/add-measurement-modal'
import { CoachRequestActions } from '@/components/coach/coach-request-actions'

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

  // Fetch pending requests for this coach
  const { data: pendingRequests } = coachId
    ? await supabase
        .from('coach_change_requests')
        .select(`
          id,
          reason,
          created_at,
          clients (
            id,
            gender,
            users ( full_name, email, phone )
          )
        `)
        .eq('requested_coach_id', coachId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    : { data: [] }

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
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          {today}
        </p>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
          Welcome back, {session.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-secondary text-sm">
          Here&apos;s an overview of your clients, requests, and monthly assessments.
        </p>
      </div>

      {/* Pending Requests Alert Banner */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div
          className="card animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, #FAF4FF 0%, #FFFFFF 100%)',
            border: '2px solid var(--brand-600)',
            marginBottom: '2rem',
            padding: 'var(--space-5)',
            boxShadow: '0 8px 30px rgba(140,86,212,0.12)',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div className="flex items-center gap-2">
              <div
                className="stat-icon"
                style={{ width: 36, height: 36, background: 'rgba(140,86,212,0.15)', color: 'var(--brand-700)' }}
              >
                <UserCheck size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--brand-900)' }}>
                  🔔 New Client Requests ({pendingRequests.length} waiting)
                </h3>
                <p className="text-secondary text-xs">These clients requested to be trained by you. Please accept or decline.</p>
              </div>
            </div>
            <Link href="/coach/requests" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
              View All Requests <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {pendingRequests.slice(0, 3).map((req: any) => {
              const user = req.clients?.users
              return (
                <div
                  key={req.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-3) var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {user?.full_name ?? 'Client'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {user?.email} {user?.phone ? `• ${user.phone}` : ''} • Note: {req.reason || 'No note'}
                    </div>
                  </div>

                  <CoachRequestActions requestId={req.id} clientName={user?.full_name ?? 'Client'} />
                </div>
              )
            })}
          </div>
        </div>
      )}

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
            <UserCheck size={20} />
          </div>
          <div>
            <div className="stat-value">{pendingRequests?.length ?? 0}</div>
            <div className="stat-label">Pending Client Requests</div>
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
            <p className="text-secondary text-sm">Your assigned clients will appear here once you accept their requests.</p>
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
