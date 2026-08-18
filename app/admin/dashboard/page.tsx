import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, CreditCard, RefreshCw, ChevronRight, Activity, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Admin Dashboard — FitTrack' }

export default async function AdminDashboardPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // 1. Fetch counts in parallel
  const [
    { count: totalClients },
    { count: activeCoaches },
    { count: activeMemberships },
    { count: pendingRequests },
  ] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('coaches').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('memberships').select('id', { count: 'exact', head: true }).gte('end_date', today),
    supabase.from('coach_change_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  // 2. Fetch pending requests
  const { data: recentRequests } = await supabase
    .from('coach_change_requests')
    .select(`
      id,
      reason,
      created_at,
      clients (
        users ( full_name )
      ),
      coaches!coach_change_requests_current_coach_id_fkey (
        users ( full_name )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(4)

  // 3. Fetch recent clients
  const { data: recentClients } = await supabase
    .from('clients')
    .select(`
      id,
      created_at,
      users ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
            Dashboard Overview
          </h1>
          <p className="text-secondary text-sm">
            Welcome back, {session.full_name.split(' ')[0]}. Here is the real-time status of Power Gym.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-4" style={{ gap: 'var(--space-4)', marginBottom: '2rem' }}>
        <Link href="/admin/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard
            icon={<Users size={20} />}
            label="Total Clients"
            value={totalClients != null ? totalClients.toString() : '0'}
            color="brand"
          />
        </Link>
        <Link href="/admin/coaches" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard
            icon={<UserCheck size={20} />}
            label="Active Coaches"
            value={activeCoaches != null ? activeCoaches.toString() : '0'}
            color="info"
          />
        </Link>
        <Link href="/admin/memberships" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard
            icon={<CreditCard size={20} />}
            label="Active Members"
            value={activeMemberships != null ? activeMemberships.toString() : '0'}
            color="success"
          />
        </Link>
        <Link href="/admin/change-requests" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard
            icon={<RefreshCw size={20} />}
            label="Pending Requests"
            value={pendingRequests != null ? pendingRequests.toString() : '0'}
            color="warning"
          />
        </Link>
      </div>

      {/* Details Grid */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Pending Requests */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={18} style={{ color: '#b45309' }} />
              Pending Coach Requests
            </h2>
            <Link href="/admin/change-requests" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-600)' }}>
              Manage <ChevronRight size={14} />
            </Link>
          </div>

          {!recentRequests || recentRequests.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No pending change requests.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentRequests.map((req: any) => (
                <div
                  key={req.id}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {req.clients?.users?.full_name ?? 'Client'}
                    </span>
                    <span className="badge badge-warning">Pending</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Current Coach: {req.coaches?.users?.full_name ?? 'Assigned'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }} className="truncate">
                    Reason: {req.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--brand-600)' }} />
              Recent Clients
            </h2>
            <Link href="/admin/clients" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-600)' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {!recentClients || recentClients.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No clients registered yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentClients.map((cl: any) => (
                <div
                  key={cl.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {cl.users?.full_name ?? 'Client'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {cl.users?.email}
                    </div>
                  </div>
                  <span className="badge badge-neutral">
                    {new Date(cl.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'brand' | 'info' | 'success' | 'warning'
}) {
  const colorMap = {
    brand:   { bg: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' },
    info:    { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
    success: { bg: 'rgba(22,163,74,0.1)',  color: '#15803d' },
    warning: { bg: 'rgba(245,158,11,0.1)', color: '#b45309' },
  }

  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{ background: colorMap[color].bg, color: colorMap[color].color }}
      >
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
