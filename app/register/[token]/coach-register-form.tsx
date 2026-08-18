'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { registerCoachAction } from './actions'

export function CoachRegisterForm({
  token,
  email,
}: {
  token: string
  email: string
}) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('token', token)
    formData.append('email', email)

    startTransition(async () => {
      const res = await registerCoachAction(formData)
      if (res.success) {
        setSuccess(true)
      } else {
        setServerError(res.error)
      }
    })
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(22,163,74,0.1)',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
          }}
        >
          <CheckCircle size={32} />
        </div>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
          Coach Account Created Successfully!
        </h3>
        <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your coach account is now active and ready. You can sign in immediately to access your coach dashboard and clients.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="btn btn-primary btn-full"
        >
          Go to Sign In
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1rem',
            background: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--status-error-text)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {serverError}
        </div>
      )}

      {/* Invited Email (Read-only) */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label>Coach Email (Invited)</label>
        <input
          type="email"
          value={email}
          disabled
          style={{ background: 'var(--cream-300)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
        />
      </div>

      {/* Full Name */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="coach-fullname">Full Name *</label>
        <input
          id="coach-fullname"
          name="fullName"
          type="text"
          placeholder="Captain Ahmed Ali"
          required
          minLength={2}
        />
      </div>

      {/* Phone */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="coach-phone">Phone Number (Optional)</label>
        <input
          id="coach-phone"
          name="phone"
          type="tel"
          placeholder="+20 100 000 0000"
        />
      </div>

      {/* Bio */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="coach-bio">Bio / Specialties (Optional)</label>
        <textarea
          id="coach-bio"
          name="bio"
          rows={2}
          placeholder="e.g. Certified personal trainer specializing in strength training and weight management..."
        />
      </div>

      {/* Password */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="coach-password">Create Password * (min 8 characters)</label>
        <div style={{ position: 'relative' }}>
          <input
            id="coach-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            minLength={8}
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="coach-confirm-password">Confirm Password *</label>
        <input
          id="coach-confirm-password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary btn-full ${isPending ? 'btn-loading' : ''}`}
        disabled={isPending}
      >
        {!isPending && <UserPlus size={16} />}
        {isPending ? 'Setting up account…' : 'Complete Coach Registration'}
      </button>
    </form>
  )
}
