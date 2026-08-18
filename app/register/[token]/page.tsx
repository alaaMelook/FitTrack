import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CoachRegisterForm } from './coach-register-form'
import { AlertCircle, Dumbbell } from 'lucide-react'

import type { InvitationRow } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Coach Registration — FitTrack',
  description: 'Complete your FitTrack coach account setup.',
}

export default async function RegisterTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Verify invitation token (coaches only)
  const { data, error } = await supabase
    .from('client_invitations')
    .select('*')
    .eq('token', token)
    .eq('role', 'coach')
    .single()

  const invitation = data as unknown as InvitationRow | null
  const isExpired = invitation ? new Date(invitation.expires_at) < new Date() : true
  const isInvalid = !invitation || error || invitation.status !== 'pending' || isExpired

  if (isInvalid) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--status-error-bg)',
            color: 'var(--status-error-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Invalid or Expired Invitation
        </h2>
        <p className="text-secondary text-sm" style={{ marginBottom: '2rem' }}>
          This coach invitation link is invalid, has already been used, or has expired. Please contact your gym administrator for a new invitation link.
        </p>
        <Link href="/login" className="btn btn-secondary btn-full">
          Return to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <span
          className="badge"
          style={{
            background: 'rgba(140,86,212,0.1)',
            color: 'var(--brand-700)',
            border: '1px solid rgba(140,86,212,0.2)',
            marginBottom: '0.75rem',
            padding: '6px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Dumbbell size={14} /> Coach Invitation
        </span>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Complete Your Coach Profile
        </h2>
        <p className="text-secondary text-sm" style={{ maxWidth: 480, margin: '0 auto' }}>
          Set up your password and credentials to activate your FitTrack trainer account.
        </p>
      </div>

      <CoachRegisterForm
        token={token}
        email={invitation.email}
      />
    </div>
  )
}
