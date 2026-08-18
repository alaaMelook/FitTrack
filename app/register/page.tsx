import type { Metadata } from 'next'
import { Dumbbell } from 'lucide-react'
import { ClientRegisterForm } from './client-register-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Join FitTrack — Create Your Account',
  description: 'Sign up to FitTrack and start your fitness journey today.',
}

export default function RegisterPage() {
  // Coaches are fetched client-side in ClientRegisterForm via /api/coaches
  // This avoids any Vercel static prerendering / server component caching issues
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

      <ClientRegisterForm />
    </div>
  )
}
