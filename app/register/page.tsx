import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClientRegisterForm } from './client-register-form'
import { Dumbbell } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Join FitTrack — Create Your Account',
  description: 'Sign up to FitTrack and start your fitness journey today.',
}

export default async function RegisterPage() {
  let coaches: any[] = []

  try {
    const adminSupabase = createAdminClient()
    const { data: coachesData } = await adminSupabase
      .from('coaches')
      .select('id, user_id, bio, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (coachesData && coachesData.length > 0) {
      const userIds = coachesData.map((c: any) => c.user_id).filter(Boolean)
      const { data: usersData } = await adminSupabase
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds)

      const userMap: Record<string, any> = {}
      if (usersData) {
        usersData.forEach((u: any) => {
          userMap[u.id] = u
        })
      }

      coaches = coachesData.map((c: any) => {
        const u = userMap[c.user_id]
        return {
          id: c.id,
          bio: c.bio,
          name: u?.full_name || 'Coach',
          email: u?.email || '',
          users: u || null,
        }
      })
    }
  } catch (err) {
    console.error('Error fetching coaches in register page:', err)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <span
          className="badge"
          style={{
            background: 'rgba(140,86,212,0.1)',
            color: 'var(--brand-700)',
            border: '1px solid rgba(140,86,212,0.2)',
            marginBottom: '0.75rem',
            padding: '6px 14px',
            fontSize: 'var(--text-xs)',
          }}
        >
          <Dumbbell size={14} style={{ display: 'inline', marginRight: 4 }} /> Power Gym Membership
        </span>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Create Your Member Account
        </h1>
        <p className="text-secondary text-sm" style={{ maxWidth: 480, margin: '0 auto' }}>
          Fill in your details below, choose your dedicated personal trainer, and start your progress journey today.
        </p>
      </div>

      <ClientRegisterForm coaches={coaches} />
    </div>
  )
}
