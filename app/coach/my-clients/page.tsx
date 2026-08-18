import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Users, Search, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { AddMeasurementModal } from '@/components/coach/add-measurement-modal'

export const metadata: Metadata = { title: 'My Clients — FitTrack' }

export default async function CoachMyClientsPage() {
  const session = await requireCoach()
  const supabase = await createClient()

  const { data: coachRow } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const { data: assignments } = coachRow
    ? await supabase
        .from('coach_assignments')
        .select(`
          id,
          started_at,
          clients (
            id,
            user_id,
            date_of_birth,
            gender,
            height_cm,
            users ( full_name, email, phone, avatar_url )
          )
        `)
        .eq('coach_id', coachRow.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
    : { data: [] }

  return (
    <div className="page-body animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>My Clients</h1>
          <p className="text-secondary text-sm">
            {assignments?.length ?? 0} client{(assignments?.length ?? 0) !== 1 ? 's' : ''} currently assigned to you
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      {!assignments || assignments.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Users size={28} /></div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No clients assigned yet</p>
          <p className="text-secondary text-sm">Ask your admin to assign clients to you.</p>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
          {assignments.map((a) => {
            const client = a.clients as any
            const user = client?.users
            const initials = user?.full_name
              ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : 'CL'

            return (
              <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Clickable Profile details */}
                <Link
                  href={`/coach/my-clients/${client?.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div
                      className="avatar-fallback"
                      style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                        color: '#fff',
                        fontSize: 'var(--text-base)',
                        fontWeight: 700,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }} className="truncate">
                        {user?.full_name ?? 'Unknown'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">
                        {user?.email ?? '—'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {client?.gender && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Gender</span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{client.gender}</span>
                      </div>
                    )}
                    {client?.height_cm && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Height</span>
                        <span style={{ fontWeight: 600 }}>{client.height_cm} cm</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned</span>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Footer Actions */}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AddMeasurementModal clientId={client?.id} />
                  <Link
                    href={`/coach/my-clients/${client?.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    View Profile <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
