'use client'

import { useTransition, useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { requestCoachChangeAction } from '@/app/client/change-coach/actions'

export function ChangeCoachForm({
  availableCoaches,
  hasPending,
}: {
  availableCoaches: Array<{ id: string; name: string }>
  hasPending: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await requestCoachChangeAction(null, formData)
      if (res.success) {
        setSubmitted(true)
      } else {
        setError(res.error)
      }
    })
  }

  if (hasPending || submitted) {
    return (
      <div className="card" style={{ background: 'rgba(140,86,212,0.06)', border: '1.5px dashed var(--brand-400)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '0.5rem' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--brand-600)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Request Submitted to Gym Management</h3>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your request to change coach is currently under review by the gym administration. You will be notified once it has been processed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1.25rem' }}>
        Submit Change Request
      </h3>

      {error && (
        <div className="badge badge-error" style={{ width: '100%', padding: 'var(--space-3)', marginBottom: '1rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="preferredCoachId">Preferred Coach (Optional)</label>
        <select id="preferredCoachId" name="preferredCoachId">
          <option value="">No preference — assign any available coach</option>
          {availableCoaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="form-hint">You can choose a specific coach or leave it to management to decide.</span>
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
        <label htmlFor="reason">Reason for Request *</label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          required
          placeholder="Please explain why you would like to switch coaches (e.g., schedule conflict, specific training goals, etc.)."
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${isPending ? 'btn-loading' : ''}`}
        disabled={isPending}
      >
        <Send size={16} /> {isPending ? 'Submitting...' : 'Submit Request to Admin'}
      </button>
    </form>
  )
}
