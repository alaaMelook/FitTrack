import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  ChevronLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  Activity,
  UserCheck,
  TrendingUp,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react'
import { CoachVisibilityToggle } from '@/components/admin/coach-visibility-toggle'
import { AdminCoachActions } from '@/components/admin/admin-coach-actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { title: 'Coach Profile & Clients — FitTrack Admin' }

export default async function AdminCoachProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: coachId } = await params
  await requireAdmin()
  const supabase = await createClient()

  // 1. Fetch coach with user profile
  const { data: coach } = await supabase
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
        phone,
        is_active
      )
    `)
    .eq('id', coachId)
    .single()

  if (!coach) notFound()

  // 2. Fetch all clients assigned to this coach with their latest measurements & memberships
  const { data: assignments } = await supabase
    .from('coach_assignments')
    .select(`
      id,
      started_at,
      ended_at,
      clients (
        id,
        gender,
        height_cm,
        created_at,
        users (
          id,
          full_name,
          email,
          phone,
          is_active
        ),
        measurements (
          id,
          measured_at,
          weight_kg,
          body_fat_pct,
          muscle_mass_kg,
          chest_cm,
          waist_cm,
          hips_cm,
          notes
        ),
        memberships (
          id,
          start_date,
          end_date
        )
      )
    `)
    .eq('coach_id', coachId)
    .order('started_at', { ascending: false })

  const user = coach.users as any
  const today = new Date().toISOString().split('T')[0]

  const activeAssignments = (assignments || []).filter((a: any) => a.ended_at === null)
  const pastAssignments = (assignments || []).filter((a: any) => a.ended_at !== null)

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CO'

  return (
    <div className="page-body animate-fade-in">
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/admin/coaches"
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', paddingLeft: 0 }}
        >
          <ChevronLeft size={16} /> Back to Coaches
        </Link>
      </div>

      {/* Coach Header Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              className="avatar-fallback avatar-xl"
              style={{
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                color: '#fff',
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                  {user?.full_name ?? 'Coach'}
                </h1>
                <CoachVisibilityToggle coachId={coach.id} initialIsActive={coach.is_active} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {user?.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Mail size={12} /> {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={12} /> {user.phone}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} /> Joined {new Date(coach.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {coach.bio && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.75rem', maxWidth: 600, lineHeight: 1.6 }}>
                  {coach.bio}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--brand-700)' }}>
                {activeAssignments.length}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Active Clients
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Clients & Progress */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--brand-600)' }} />
            Assigned Clients & Performance Results ({activeAssignments.length})
          </h2>
          <p className="text-secondary text-xs">
            Review all clients training under this coach, their latest measurements, and body evolution.
          </p>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-icon"><Users size={28} /></div>
            <p style={{ fontWeight: 600 }}>No clients currently assigned to this coach.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Latest Weight</th>
                  <th>Body Fat %</th>
                  <th>Muscle Mass</th>
                  <th>Assessments</th>
                  <th>Membership</th>
                  <th>Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {activeAssignments.map((a: any) => {
                  const client = a.clients
                  const clientUser = client?.users
                  const measurements = (client?.measurements || []).sort(
                    (m1: any, m2: any) => new Date(m2.measured_at).getTime() - new Date(m1.measured_at).getTime()
                  )
                  const latestM = measurements[0]
                  const latestMem = (client?.memberships || []).sort(
                    (m1: any, m2: any) => new Date(m2.end_date).getTime() - new Date(m1.end_date).getTime()
                  )[0]
                  const isMemActive = latestMem ? latestMem.end_date >= today : false

                  const clientInitials = clientUser?.full_name
                    ? clientUser.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'CL'

                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div
                            className="avatar-fallback avatar-md"
                            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 700 }}
                          >
                            {clientInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{clientUser?.full_name ?? 'Client'}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{clientUser?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{clientUser?.phone || '—'}</td>
                      <td>
                        {latestM?.weight_kg != null ? (
                          <span style={{ fontWeight: 700, color: 'var(--brand-700)' }}>{latestM.weight_kg} kg</span>
                        ) : '—'}
                      </td>
                      <td>{latestM?.body_fat_pct != null ? `${latestM.body_fat_pct}%` : '—'}</td>
                      <td>{latestM?.muscle_mass_kg != null ? `${latestM.muscle_mass_kg} kg` : '—'}</td>
                      <td>
                        <span className="badge badge-purple" style={{ fontWeight: 600 }}>
                          {measurements.length} log{measurements.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        {latestMem ? (
                          <span className={isMemActive ? 'badge badge-success' : 'badge badge-error'} style={{ fontSize: 10 }}>
                            {isMemActive ? 'Active' : 'Expired'}
                          </span>
                        ) : (
                          <span className="badge badge-neutral">None</span>
                        )}
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
