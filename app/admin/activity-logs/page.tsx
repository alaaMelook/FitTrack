import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { ScrollText, Clock, User, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Activity Logs — FitTrack' }

export default async function AdminActivityLogsPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  // Fetch recent activity logs
  const { data: logs } = await supabase
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
    .limit(50)

  return (
    <div className="page-body animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Activity Logs</h1>
        <p className="text-secondary text-sm">
          Audit trail of gym events, assignments, memberships, and measurements.
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
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {log.actor?.full_name || 'System'}
                    </div>
                    {log.actor?.role && (
                      <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {log.actor.role}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--brand-700)' }}>
                    {log.action}
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {log.entity_type || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
