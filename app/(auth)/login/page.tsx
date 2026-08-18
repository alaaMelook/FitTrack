import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your FitTrack account.',
}

export default function LoginPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Welcome back
        </h2>
        <p className="text-secondary text-sm">
          Sign in to your FitTrack account to continue.
        </p>
      </div>

      <LoginForm />

      <p className="text-secondary text-sm" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        New member?{' '}
        <Link href="/register" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>
          Create your account
        </Link>
      </p>

      <p className="text-muted" style={{ marginTop: '2rem', textAlign: 'center', fontSize: 'var(--text-xs)' }}>
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
