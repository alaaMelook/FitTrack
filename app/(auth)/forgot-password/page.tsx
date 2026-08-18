import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your FitTrack account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Reset your password
        </h2>
        <p className="text-secondary text-sm">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-secondary text-sm" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'var(--text-brand)', fontWeight: 600 }}>
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}
