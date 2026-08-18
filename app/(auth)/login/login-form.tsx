'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { loginAction, type LoginState } from './actions'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  )

  return (
    <form action={formAction} noValidate>
      {/* General Server Error Banner */}
      {state?.error && (
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
          {state.error}
        </div>
      )}

      {/* Email */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          defaultValue="alaamelook89@gmail.com"
          className={state?.fieldErrors?.email ? 'input-error' : ''}
          required
        />
        {state?.fieldErrors?.email && (
          <span className="form-error">
            <AlertCircle size={12} />
            {state.fieldErrors.email[0]}
          </span>
        )}
      </div>

      {/* Password */}
      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="login-password">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            defaultValue="Admin@123456"
            className={state?.fieldErrors?.password ? 'input-error' : ''}
            style={{ paddingRight: '2.75rem' }}
            required
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
        {state?.fieldErrors?.password && (
          <span className="form-error">
            <AlertCircle size={12} />
            {state.fieldErrors.password[0]}
          </span>
        )}
      </div>

      {/* Forgot password */}
      <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
        <Link
          href="/forgot-password"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="login-submit-btn"
        className={`btn btn-primary btn-full ${isPending ? 'btn-loading' : ''}`}
        disabled={isPending}
      >
        {!isPending && <LogIn size={16} />}
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
