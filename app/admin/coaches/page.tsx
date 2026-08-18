import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { UserCheck, Users, Mail, Phone, Plus, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Coaches Management — FitTrack' }

export default async function AdminCoachesPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  // Fetch all coaches with assigned clients count
  const { data: coaches } = await supabase
    .from('coaches')
    .select(`
      id,
      bio,
      is_active,
      created_at,
      users (
        full_name,
        email,
        phone
      ),
      coach_assignments (
        id,
        ended_at
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="page-body animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Coaches Management</h1>
          <p className="text-secondary text-sm">
            {coaches?.length ?? 0} coach{(coaches?.length ?? 0) !== 1 ? 'es' : ''} registered
          </p>
        </div>
        <Link href="/admin/invitations" className="btn btn-primary btn-sm">
          <Plus size={16} /> Invite New Coach
        </Link>
      </div>

      {!coaches || coaches.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><UserCheck size={28} /></div>
          <p style={{ fontWeight: 600 }}>No coaches found</p>
          <p className="text-secondary text-sm">Click &quot;Invite New Coach&quot; to add a coach.</p>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 'var(--space-6)' }}>
          {coaches.map((c: any) => {
            const user = c.users
            const activeClientsCount = (c.coach_assignments || []).filter((a: any) => a.ended_at === null).length

            const initials = user?.full_name
              ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : 'CO'

            return (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '1.25rem' }}>
                    <div
                      className="avatar-fallback avatar-md"
                      style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 700 }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }} className="truncate">
                        {user?.full_name ?? 'Coach'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {c.bio || 'Professional fitness trainer at Power Gym.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--brand-700)' }}>
                    <Users size={14} /> {activeClientsCount} Active Client{activeClientsCount !== 1 ? 's' : ''}
                  </div>
                  <span className={c.is_active ? 'badge badge-success' : 'badge badge-neutral'}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
