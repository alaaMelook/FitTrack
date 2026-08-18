'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, KeyRound, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ResetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetFields = z.infer<typeof ResetSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFields>({
    resolver: zodResolver(ResetSchema),
  })

  async function onSubmit(values: ResetFields) {
    setIsLoading(true)
    setServerError(null)

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    setIsLoading(false)

    if (error) {
      setServerError(error.message || 'Failed to update password.')
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/login')
    }, 2000)
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
            Password updated successfully!
          </p>
          <p className="text-secondary text-sm">Redirecting to login…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Choose a new password
        </h2>
        <p className="text-secondary text-sm">
          Enter your new password below.
        </p>
      </div>

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

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="reset-new-password">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={errors.password ? 'input-error' : ''}
              style={{ paddingRight: '2.75rem' }}
              {...register('password')}
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
          {errors.password && (
            <span className="form-error">
              <AlertCircle size={12} />
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="reset-confirm-password">Confirm New Password</label>
          <input
            id="reset-confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={errors.confirmPassword ? 'input-error' : ''}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className="form-error">
              <AlertCircle size={12} />
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-full ${isLoading ? 'btn-loading' : ''}`}
          disabled={isLoading}
        >
          {!isLoading && <KeyRound size={16} />}
          {isLoading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
