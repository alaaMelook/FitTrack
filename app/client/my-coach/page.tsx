import type { Metadata } from 'next'
import Link from 'next/link'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { UserCheck, Mail, Phone, Calendar, RefreshCw, AlertCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'My Coach — FitTrack' }

export default async function ClientMyCoachPage() {
  const session = await requireClient()
  const supabase = await createClient()

  // Get client ID
  const { data: clientRow } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .single()

  const clientId = clientRow?.id

  // Fetch active coach assignment
  const { data: assignment } = clientId
    ? await supabase
        .from('coach_assignments')
        .select(`
          id,
          started_at,
          coaches (
            id,
            bio,
            users (
              full_name,
              email,
              phone,
              avatar_url
            )
          )
        `)
        .eq('client_id', clientId)
        .is('ended_at', null)
        .maybeSingle()
    : { data: null }

  const coach = (assignment?.coaches as any)
  const coachUser = coach?.users

  const initials = coachUser?.full_name
    ? coachUser.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CO'

  return (
    <div className="page-body animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>My Assigned Coach</h1>
          <p className="text-secondary text-sm">Your dedicated fitness coach and mentor.</p>
        </div>
        {assignment && (
          <Link href="/client/change-coach" className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Request Coach Change
          </Link>
        )}
      </div>

      {!assignment ? (
        <div className="card empty-state">
          <div className="empty-icon"><UserCheck size={28} /></div>
          <p style={{ fontWeight: 600 }}>No coach assigned yet</p>
          <p className="text-secondary text-sm">Your gym admin will assign a coach to your account shortly.</p>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
          {/* Coach Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: '1.5rem' }}>
              <div
                className="avatar-fallback"
                style={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                  color: '#fff',
                  fontSize: 'var(--text-xl)',
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
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{coachUser?.full_name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                  <span className="badge badge-success">Assigned Coach</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                <Mail size={16} style={{ color: 'var(--brand-600)' }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Email</div>
                  <div style={{ fontWeight: 600 }}>{coachUser?.email}</div>
                </div>
              </div>

              {coachUser?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                  <Phone size={16} style={{ color: 'var(--brand-600)' }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Phone</div>
                    <div style={{ fontWeight: 600 }}>{coachUser.phone}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                <Calendar size={16} style={{ color: 'var(--brand-600)' }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Working Together Since</div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(assignment.started_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coach Bio */}
          <div className="card">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem' }}>
              About Coach {coachUser?.full_name?.split(' ')[0]}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {coach?.bio || 'Certified Strength & Conditioning Coach dedicated to helping you achieve your fitness milestones safely and efficiently.'}
            </p>

            <div style={{ background: 'var(--cream-300)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                Training Philosophy
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Progressive overload, personalized nutrition, and monthly measurement tracking for sustainable lifelong results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
