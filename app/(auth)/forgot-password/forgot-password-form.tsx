'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const Schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type Fields = z.infer<typeof Schema>

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(Schema),
  })

  async function onSubmit(values: Fields) {
    setIsLoading(true)
    setServerError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      setServerError('Failed to send reset email. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '2rem',
          background: 'var(--status-success-bg)',
          border: '1px solid var(--status-success-border)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
        }}
      >
        <CheckCircle size={40} style={{ color: 'var(--status-success-text)' }} />
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Check your email
          </p>
          <p className="text-secondary text-sm">
            We&apos;ve sent a password reset link. It expires in 60 minutes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="reset-email">Email address</label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          className={errors.email ? 'input-error' : ''}
          {...register('email')}
        />
        {errors.email && (
          <span className="form-error">
            <AlertCircle size={12} />
            {errors.email.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        id="reset-password-submit-btn"
        className={`btn btn-primary btn-full ${isLoading ? 'btn-loading' : ''}`}
        disabled={isLoading}
      >
        {!isLoading && <Mail size={16} />}
        {isLoading ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  )
}
