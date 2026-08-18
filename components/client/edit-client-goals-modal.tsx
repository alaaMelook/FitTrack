'use client'

import { useState, useTransition } from 'react'
import { FileText, X, Check, Pencil, AlertCircle } from 'lucide-react'
import { updateClientGoalsAndNotesAction } from '@/app/client/actions'

interface Props {
  initialNotes: string | null
  initialEmergencyName: string | null
  initialEmergencyPhone: string | null
}

export function EditClientGoalsModal({
  initialNotes,
  initialEmergencyName,
  initialEmergencyPhone,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateClientGoalsAndNotesAction(null, formData)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setIsOpen(false)
        }, 1000)
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
        className="btn btn-ghost btn-sm"
        style={{
          color: 'var(--brand-700)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 10px',
          fontSize: 'var(--text-xs)',
        }}
      >
        <Pencil size={13} /> Edit Goals & Notes
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 520 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div
                  className="stat-icon"
                  style={{ width: 36, height: 36, background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>My Goals & Medical Notes</h3>
                  <p className="text-secondary text-xs">Shared with your assigned coach for safe training.</p>
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
              <div className="badge badge-error" style={{ width: '100%', marginBottom: '1rem', padding: '8px 12px' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {success && (
              <div className="badge badge-success" style={{ width: '100%', marginBottom: '1rem', padding: '8px 12px' }}>
                <Check size={14} /> Goals and notes saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="client-notes" style={{ fontWeight: 600 }}>
                  Fitness Goals & Medical Notes / Injuries
                </label>
                <textarea
                  id="client-notes"
                  name="notes"
                  rows={4}
                  defaultValue={initialNotes || ''}
                  placeholder="e.g. Goal: Build muscle and lose 5kg fat. Medical: Minor lower back stiffness, no heavy deadlifts..."
                />
              </div>

              <div className="form-row" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="form-group">
                  <label htmlFor="client-emergency-name">Emergency Contact Name</label>
                  <input
                    id="client-emergency-name"
                    name="emergencyContactName"
                    type="text"
                    defaultValue={initialEmergencyName || ''}
                    placeholder="e.g. Mohamed Ali (Brother)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="client-emergency-phone">Emergency Phone</label>
                  <input
                    id="client-emergency-phone"
                    name="emergencyContactPhone"
                    type="tel"
                    defaultValue={initialEmergencyPhone || ''}
                    placeholder="+20 100 000 0000"
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
                  {isPending ? 'Saving...' : 'Save Goals & Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
