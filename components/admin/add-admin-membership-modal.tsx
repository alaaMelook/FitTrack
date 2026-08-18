'use client'

import { useState, useTransition } from 'react'
import { Plus, X, CreditCard, Calendar } from 'lucide-react'
import { addAdminMembershipAction } from '@/app/admin/memberships/actions'

type ClientOption = {
  id: string
  users: { full_name: string; email: string } | null
}

export function AddAdminMembershipModal({ clients }: { clients: ClientOption[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const defaultEndStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(defaultEndStr)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await addAdminMembershipAction(null, formData)
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
        <Plus size={16} /> Add Membership
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(26,16,37,0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
        >
          <div
            className="card animate-scale-in"
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div
                  className="stat-icon"
                  style={{ width: 36, height: 36, background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}
                >
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Set Client Expiration Date</h3>
                  <p className="text-secondary text-xs">Activate or extend client subscription period.</p>
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
                {error}
              </div>
            )}

            {success && (
              <div className="badge badge-success" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', marginBottom: '1rem' }}>
                Membership active until {endDate}!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Select Client */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="clientId">Select Client *</label>
                <select id="clientId" name="clientId" required defaultValue="">
                  <option value="" disabled>Choose client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.users?.full_name ?? 'Client'} ({c.users?.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start & End Dates */}
              <div className="form-row" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="form-group">
                  <label htmlFor="startDate" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} /> Start Date *
                  </label>
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
                  <label htmlFor="endDate" style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--brand-700)' }}>
                    <Calendar size={14} /> End Date (تاريخ الانتهاء) *
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ borderColor: 'var(--brand-600)', borderWidth: 1.5 }}
                    required
                  />
                </div>
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
