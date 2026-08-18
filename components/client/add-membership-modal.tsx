'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { addClientMembershipAction } from '@/app/client/my-membership/actions'

export function AddMembershipModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(todayStr)

  // Default end date is 1 month from today
  const defaultEndDate = new Date()
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 1)
  const [endDate, setEndDate] = useState(defaultEndDate.toISOString().split('T')[0])

  const setQuickDuration = (months: number) => {
    const s = new Date(startDate || todayStr)
    const e = new Date(s)
    e.setMonth(e.getMonth() + months)
    setEndDate(e.toISOString().split('T')[0])
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await addClientMembershipAction(null, formData)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setIsOpen(false)
        }, 1200)
      } else {
        setError(res.error)
      }
    })
  }

  // Calculate days remaining
  const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true)
          setError(null)
          setSuccess(false)
        }}
        className="btn btn-primary btn-sm"
      >
        <Plus size={16} /> Add / Renew Membership
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 500 }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div
                  className="stat-icon"
                  style={{ width: 36, height: 36, background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Set Membership Expiration</h3>
                  <p className="text-secondary text-xs">Choose how long your subscription should remain active.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-icon"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="badge badge-error" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', marginBottom: '1rem' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {success && (
              <div className="badge badge-success" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', marginBottom: '1rem' }}>
                <CheckCircle2 size={14} /> Membership updated and active until {endDate}!
              </div>
            )}

            {/* Quick preset chips */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Quick Duration:
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setQuickDuration(1)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(3)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                >
                  +3 Months
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(6)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                >
                  +6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(12)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                >
                  +1 Year
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Dates */}
              <div className="form-row" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
                    End Date *
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ borderColor: 'var(--brand-600)', borderWidth: 2 }}
                    required
                  />
                </div>
              </div>

              {/* Status Preview */}
              <div
                style={{
                  background: daysDiff > 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                  border: `1.5px solid ${daysDiff > 0 ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  marginBottom: 'var(--space-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: daysDiff > 0 ? '#15803d' : '#b91c1c' }}>
                    {daysDiff > 0 ? 'Active Account Period' : 'Expired Date Selected'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    Active until: <strong>{endDate}</strong> ({daysDiff > 0 ? `${daysDiff} days from now` : 'Already past'})
                  </div>
                </div>
                <span className={daysDiff > 0 ? 'badge badge-success' : 'badge badge-error'}>
                  {daysDiff > 0 ? 'Active' : 'Expired'}
                </span>
              </div>

              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm ${isPending ? 'btn-loading' : ''}`}
                  disabled={isPending}
                >
                  {isPending ? 'Saving...' : 'Save & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
