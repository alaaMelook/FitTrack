import type { Metadata } from 'next'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { User, Phone, Mail, FileText, CheckCircle2, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'My Profile — FitTrack' }

export default async function CoachProfilePage() {
  const session = await requireCoach()
  const supabase = await createClient()

  const { data: coach } = await supabase
    .from('coaches')
    .select(`
      id,
      bio,
      is_active,
      created_at,
      gyms ( name, address, phone )
    `)
    .eq('user_id', session.id)
    .single()

  const { data: user } = await supabase
    .from('users')
    .select('phone, created_at')
    .eq('id', session.id)
    .single()

  const initials = session.full_name
    ? session.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CO'

  const gym = (coach as any)?.gyms

  return (
    <div className="page-body animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>My Profile</h1>
        <p className="text-secondary text-sm">View and manage your coach credentials.</p>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Profile Card */}
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
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{session.full_name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                <span className="badge badge-purple">Coach</span>
                <span className="badge badge-success">Active Status</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              <Mail size={16} style={{ color: 'var(--brand-600)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Email Address</div>
                <div style={{ fontWeight: 600 }}>{session.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              <Phone size={16} style={{ color: 'var(--brand-600)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Phone Number</div>
                <div style={{ fontWeight: 600 }}>{user?.phone || '+20 101 111 2222'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              <Shield size={16} style={{ color: 'var(--brand-600)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Gym Location</div>
                <div style={{ fontWeight: 600 }}>{gym?.name || 'Power Gym - Main Branch'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Card */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--brand-600)' }} />
            Coach Biography
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {coach?.bio || 'Certified Strength & Conditioning Coach specializing in bodybuilding, weight loss, and athletic performance programming.'}
          </p>

          <div style={{ background: 'var(--cream-300)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Specialties
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral">Hypertrophy</span>
              <span className="badge badge-neutral">Fat Loss</span>
              <span className="badge badge-neutral">Mobility</span>
              <span className="badge badge-neutral">Nutrition Planning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
