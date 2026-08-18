import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Users, Mail, Phone, Calendar, UserCheck, Plus, Search, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Clients Management — FitTrack' }

export default async function AdminClientsPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  // Fetch all clients with their user details, active coach, and latest membership
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id,
      gender,
      height_cm,
      emergency_contact_name,
      emergency_contact_phone,
      created_at,
      users (
        id,
        full_name,
        email,
        phone,
        is_active
      ),
      coach_assignments (
        id,
        started_at,
        ended_at,
        coaches (
          users ( full_name )
        )
      ),
      memberships (
        id,
        plan_name,
        start_date,
        end_date
      )
    `)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Clients Management</h1>
          <p className="text-secondary text-sm">
            {clients?.length ?? 0} registered client{(clients?.length ?? 0) !== 1 ? 's' : ''} in Power Gym
          </p>
        </div>
        <Link href="/admin/invitations" className="btn btn-primary btn-sm">
          <Plus size={16} /> Invite New Client
        </Link>
      </div>

      {/* Clients Table */}
      {!clients || clients.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Users size={28} /></div>
          <p style={{ fontWeight: 600 }}>No clients found</p>
          <p className="text-secondary text-sm">Click &quot;Invite New Client&quot; to send an invitation.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Phone</th>
                <th>Assigned Coach</th>
                <th>Membership</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any) => {
                const user = c.users
                const activeAssignment = (c.coach_assignments || []).find((a: any) => a.ended_at === null)
                const coachName = activeAssignment?.coaches?.users?.full_name

                const latestMembership = (c.memberships || [])
                  .sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0]

                const isMemActive = latestMembership ? latestMembership.end_date >= today : false

                const initials = user?.full_name
                  ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'CL'

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          className="avatar-fallback avatar-md"
                          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 700 }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{user?.full_name ?? '—'}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{user?.phone || '—'}</td>
                    <td>
                      {coachName ? (
                        <span className="badge badge-purple" style={{ fontWeight: 600 }}>{coachName}</span>
                      ) : (
                        <span className="badge badge-neutral">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {latestMembership ? (
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{latestMembership.plan_name}</div>
                          <span className={isMemActive ? 'badge badge-success' : 'badge badge-error'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                            {isMemActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-neutral">None</span>
                      )}
                    </td>
                    <td>
                      <span className={user?.is_active ? 'badge badge-success' : 'badge badge-neutral'}>
                        {user?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
