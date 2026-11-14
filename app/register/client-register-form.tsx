'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { registerClientAction } from './actions'
import styles from './register.module.css'

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
  const [selectedCoach, setSelectedCoach] = useState('')
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState(false)

  useEffect(() => {
    fetch('/api/coaches')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load coaches')
        return res.json()
      })
      .then((data) => setCoaches(data.coaches || []))
      .catch((err) => {
        console.error('Failed to load coaches:', err)
        setCoachesError(true)
      })
      .finally(() => setCoachesLoading(false))
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await registerClientAction(formData)
      if (res.success) setSuccess(true)
      else setError(res.error)
    })
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}><CheckCircle size={30} /></div>
        <h2>Account created!</h2>
        <p>Your FitTrack account is ready. Sign in to get started.</p>
        <button onClick={() => router.push('/login')} className="btn btn-primary btn-lg">
          Sign in to FitTrack
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div role="alert" className={styles.error}>
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="reg-fullname">Full name</label>
        <input id="reg-fullname" name="fullName" type="text" placeholder="Your name" autoComplete="name" required minLength={2} />
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-email">Email address</label>
        <input id="reg-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-phone">Phone number</label>
        <input id="reg-phone" name="phone" type="tel" placeholder="+20 100 000 0000" autoComplete="tel" required />
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-gender">Gender</label>
        <select id="reg-gender" name="gender" required defaultValue="">
          <option value="" disabled>Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>

      <fieldset className={styles.coachField}>
        <legend>Choose your coach</legend>
        {coachesLoading ? (
          <div className={styles.coachMessage} aria-live="polite">
            <Loader2 size={18} className={styles.spinner} /> Loading available coaches…
          </div>
        ) : coachesError || coaches.length === 0 ? (
          <p className={styles.coachMessage} role="status">No coaches are available right now. Please try again later.</p>
        ) : (
          <div className={styles.coachList}>
            {coaches.map((coach) => {
              const coachName = coach.name || 'Coach'
              const initials = coachName.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
              return (
                <label key={coach.id} htmlFor={`coach-${coach.id}`} className={`${styles.coachOption} ${selectedCoach === coach.id ? styles.coachSelected : ''}`}>
                  <input
                    type="radio"
                    id={`coach-${coach.id}`}
                    name="coachId"
                    value={coach.id}
                    checked={selectedCoach === coach.id}
                    onChange={() => setSelectedCoach(coach.id)}
                    required
                  />
                  <span className={styles.coachAvatar} aria-hidden="true">{initials}</span>
                  <span className={styles.coachInfo}>
                    <span className={styles.coachName}>{coachName}</span>
                    {coach.bio && <span className={styles.coachBio}>{coach.bio}</span>}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="reg-password">Password</label>
        <div className={styles.passwordInput}>
          <input
            id="reg-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-confirm">Confirm password</label>
        <input id="reg-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Enter your password again" autoComplete="new-password" required />
      </div>

      <button
        type="submit"
        className={`btn btn-primary btn-full btn-lg ${isPending ? 'btn-loading' : ''}`}
        disabled={isPending || coachesLoading || coaches.length === 0}
      >
        {!isPending && <UserPlus size={19} />}
        {isPending ? 'Creating your account…' : 'Create account'}
      </button>
      <p className={styles.formNote}>Your details are only used to set up your FitTrack account.</p>
    </form>
  )
}
