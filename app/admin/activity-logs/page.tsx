import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { ScrollText, Clock, User, Shield, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Activity Logs — FitTrack' }

export default async function AdminActivityLogsPage() {
  const session = await requireAdmin()
  const db: any = createAdminClient()

  // Fetch recent activity logs
  const { data: logs } = await db
    .from('activity_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      actor:users!activity_logs_actor_user_id_fkey (
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="page-body animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Activity Logs</h1>
        <p className="text-secondary text-sm">
          Audit trail of gym events, assignments, memberships, plans, and administrative actions.
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><ScrollText size={28} /></div>
          <p style={{ fontWeight: 600 }}>No activity logged yet</p>
          <p className="text-secondary text-sm">All administrative and gym events will be tracked here.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const metaString = log.metadata && Object.keys(log.metadata).length > 0
                  ? Object.entries(log.metadata)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' • ')
                  : null

                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#0f172a' }}>
                        {log.actor?.full_name || 'System / Admin'}
                      </div>
                      {log.actor?.role && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            background: log.actor.role === 'admin' ? '#ede9fe' : '#f1f5f9',
                            color: log.actor.role === 'admin' ? '#6d28d9' : '#475569',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          {log.actor.role}
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-700)' }}>
                      {log.action}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {log.entity_type ? (
                        <span className="badge badge-neutral" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                          {log.entity_type}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: 280 }}>
                      {metaString || '—'}
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
