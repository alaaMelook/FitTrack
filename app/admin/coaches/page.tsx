import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserCheck, Users, Plus } from 'lucide-react'
import { CoachVisibilityToggle } from '@/components/admin/coach-visibility-toggle'
import { AdminCoachActions } from '@/components/admin/admin-coach-actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Coaches Management — FitTrack' }

export default async function AdminCoachesPage() {
  await requireAdmin()
  const supabase = await createClient()

  // 1. Fetch coaches using session-authenticated client (exact same as dashboard)
  let { data: coaches, error } = await supabase
    .from('coaches')
    .select(`
      id,
      bio,
      is_active,
      created_at,
      users (
        id,
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

  // 2. Fallback to admin client if needed
  if ((!coaches || coaches.length === 0) && !error) {
    try {
      const adminClient = createAdminClient()
      const { data: adminCoaches } = await adminClient
        .from('coaches')
        .select(`
          id,
          bio,
          is_active,
          created_at,
          users (
            id,
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
      if (adminCoaches && adminCoaches.length > 0) {
        coaches = adminCoaches
      }
    } catch (e) {
      console.error('Admin coaches fallback error:', e)
    }
  }

  return (
    <div className="page-body animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Coaches Management</h1>
          <p className="text-secondary text-sm">
            {coaches?.length ?? 0} coach{(coaches?.length ?? 0) !== 1 ? 'es' : ''} registered • Toggle visibility to show or hide from public registration.
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
              <div
                key={c.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: c.is_active ? 1 : 0.6,
                }}
              >
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
                        {user?.email} {user?.phone ? `• ${user.phone}` : ''}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {c.bio || 'Professional fitness trainer at Power Gym.'}
                  </p>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <Link
                      href={`/admin/coaches/${c.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--brand-700)', textDecoration: 'none' }}
                      title="View coach profile and their assigned clients progress"
                    >
                      <Users size={14} /> {activeClientsCount} Active Client{activeClientsCount !== 1 ? 's' : ''} →
                    </Link>
                    <CoachVisibilityToggle coachId={c.id} initialIsActive={c.is_active} />
                  </div>

                  {user?.id && (
                    <AdminCoachActions
                      coachId={c.id}
                      coachUserId={user.id}
                      isActive={c.is_active}
                      coachName={user.full_name ?? 'Coach'}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
