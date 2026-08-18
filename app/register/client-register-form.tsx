'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Dumbbell, Loader2 } from 'lucide-react'
import { registerClientAction } from './actions'

type Coach = {
  id: string
  bio: string | null
  name: string
  email: string
}

export function ClientRegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState<string>('')

  // Coaches loaded client-side from /api/coaches — always live, never cached
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState(false)

  useEffect(() => {
    setCoachesLoading(true)
    fetch('/api/coaches')
      .then((res) => res.json())
      .then((data) => {
        setCoaches(data.coaches || [])
        setCoachesLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load coaches:', err)
        setCoachesError(true)
        setCoachesLoading(false)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await registerClientAction(formData)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error)
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
        <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
          Account Created Successfully!
        </h3>
        <p className="text-secondary text-sm" style={{ marginBottom: '2rem', lineHeight: 1.6 }}>
          Welcome to FitTrack! Your account is active and your coach has been assigned. You can sign in immediately.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', maxWidth: 300 }}
        >
          Sign In to Your Dashboard
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
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
            marginBottom: '1.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--status-error-text)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Row 1: Full Name & Email */}
      <div className="form-row" style={{ marginBottom: '1.25rem' }}>
        <div className="form-group">
          <label htmlFor="reg-fullname">Full Name *</label>
          <input
            id="reg-fullname"
            name="fullName"
            type="text"
            placeholder="e.g. Alaa Mohamed"
            required
            minLength={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address *</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="alaa@example.com"
            required
          />
        </div>
      </div>

      {/* Row 2: Phone & Gender */}
      <div className="form-row" style={{ marginBottom: '1.25rem' }}>
        <div className="form-group">
          <label htmlFor="reg-phone">Phone Number *</label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            placeholder="+20 100 000 0000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-gender">Gender *</label>
          <select id="reg-gender" name="gender" required defaultValue="">
            <option value="" disabled>Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      {/* Row 3: Date of Birth & Height */}
      <div className="form-row" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label htmlFor="reg-dob">Date of Birth</label>
          <input
            id="reg-dob"
            name="dateOfBirth"
            type="date"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-height">Height (cm) — Optional</label>
          <input
            id="reg-height"
            name="heightCm"
            type="number"
            step="0.5"
            min="100"
            max="250"
            placeholder="e.g. 165"
          />
        </div>
      </div>

      {/* Choose Coach Section */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem', fontWeight: 700 }}>
          <Dumbbell size={16} style={{ color: 'var(--brand-600)' }} />
          Choose Your Coach *
        </label>

        {coachesLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 'var(--space-4)',
              background: 'var(--cream-300)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
            }}
          >
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Loading coaches…
          </div>
        ) : coachesError || coaches.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--cream-300)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
            }}
          >
            No coaches available right now. Please contact the gym.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
            {coaches.map((coach) => {
              const coachName = coach.name || 'Coach'
              const isSelected = selectedCoach === coach.id
              const initials = coachName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
              return (
                <label
                  key={coach.id}
                  htmlFor={`coach-${coach.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(140,86,212,0.07)' : '#fff',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="radio"
                    id={`coach-${coach.id}`}
                    name="coachId"
                    value={coach.id}
                    checked={isSelected}
                    onChange={() => setSelectedCoach(coach.id)}
                    required
                    style={{ accentColor: 'var(--brand-600)', width: 18, height: 18, flexShrink: 0 }}
                  />
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 'var(--text-sm)',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }} className="truncate">
                      {coachName}
                    </div>
                    {coach.bio && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">
                        {coach.bio}
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Row 4: Password & Confirm Password */}
      <div className="form-row" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label htmlFor="reg-password">Password * (min 8 characters)</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reg-password"
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

        <div className="form-group">
          <label htmlFor="reg-confirm">Confirm Password *</label>
          <input
            id="reg-confirm"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className={`btn btn-primary btn-full ${isPending ? 'btn-loading' : ''}`}
        disabled={isPending || coachesLoading || coaches.length === 0}
        style={{ padding: 'var(--space-4)', fontSize: 'var(--text-base)' }}
      >
        {!isPending && <UserPlus size={18} />}
        {isPending ? 'Creating Your Account…' : 'Create My Account'}
      </button>
    </form>
  )
}
