'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Activity, Calendar } from 'lucide-react'
import { addMeasurementAction } from '@/app/coach/my-clients/actions'

export function AddMeasurementModal({ clientId }: { clientId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const [measuredAt, setMeasuredAt] = useState(todayStr)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await addMeasurementAction(null, formData)
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
          setMeasuredAt(todayStr)
        }}
        className="btn btn-primary btn-sm"
      >
        <Plus size={16} /> Log Measurement
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
              maxWidth: 580,
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              background: '#ffffff',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div
                  className="stat-icon"
                  style={{ width: 36, height: 36, background: 'rgba(140,86,212,0.1)', color: 'var(--brand-600)' }}
                >
                  <Activity size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Log Client Measurement</h3>
                  <p className="text-secondary text-xs">All fields are optional — enter any available assessment data.</p>
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
              <div
                className="badge badge-error"
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', marginBottom: '1rem' }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="badge badge-success"
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', marginBottom: '1rem' }}
              >
                Measurements saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input type="hidden" name="clientId" value={clientId} />

              {/* 1. Date */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="measuredAt" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--brand-700)' }}>
                  <Calendar size={16} /> Assessment Date (تاريخ القياس)
                </label>
                <input
                  id="measuredAt"
                  name="measuredAt"
                  type="date"
                  value={measuredAt}
                  max={todayStr}
                  onChange={(e) => setMeasuredAt(e.target.value)}
                  style={{ borderColor: 'var(--brand-600)', borderWidth: 1.5 }}
                />
              </div>

              {/* 2. Chest & 3. Arm */}
              <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label htmlFor="chestCm">Chest (الصدر - cm)</label>
                  <input id="chestCm" name="chestCm" type="number" step="0.1" placeholder="e.g. 92.0" />
                </div>
                <div className="form-group">
                  <label htmlFor="armCm">Arm (الذراع - cm)</label>
                  <input id="armCm" name="armCm" type="number" step="0.1" placeholder="e.g. 30.5" />
                </div>
              </div>

              {/* 4. Glutes & 5. Abs */}
              <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label htmlFor="glutesCm">Glutes (الأرداف / المؤخرة - cm)</label>
                  <input id="glutesCm" name="glutesCm" type="number" step="0.1" placeholder="e.g. 102.0" />
                </div>
                <div className="form-group">
                  <label htmlFor="absCm">Abs (البطن - cm)</label>
                  <input id="absCm" name="absCm" type="number" step="0.1" placeholder="e.g. 76.0" />
                </div>
              </div>

              {/* 6. Leg & 7. Calf */}
              <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label htmlFor="legCm">Leg (الأرجل / الفخذ - cm)</label>
                  <input id="legCm" name="legCm" type="number" step="0.1" placeholder="e.g. 56.0" />
                </div>
                <div className="form-group">
                  <label htmlFor="calfCm">Calf (السمانة - cm)</label>
                  <input id="calfCm" name="calfCm" type="number" step="0.1" placeholder="e.g. 36.5" />
                </div>
              </div>

              {/* 8. Back & 9. Weight */}
              <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label htmlFor="backCm">Back (الظهر - cm)</label>
                  <input id="backCm" name="backCm" type="number" step="0.1" placeholder="e.g. 105.0" />
                </div>
                <div className="form-group">
                  <label htmlFor="weightKg">Weight (الوزن - kg)</label>
                  <input id="weightKg" name="weightKg" type="number" step="0.1" min="20" max="300" placeholder="e.g. 68.0" />
                </div>
              </div>

              {/* 10. Body Fat & 11. Muscle Mass */}
              <div className="form-row" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="bodyFatPct">Body Fat (نسبة الدهون - %)</label>
                  <input id="bodyFatPct" name="bodyFatPct" type="number" step="0.1" min="3" max="65" placeholder="e.g. 24.5" />
                </div>
                <div className="form-group">
                  <label htmlFor="muscleMassKg">Muscle Mass (الكتلة العضلية - kg)</label>
                  <input id="muscleMassKg" name="muscleMassKg" type="number" step="0.1" placeholder="e.g. 32.0" />
                </div>
              </div>

              {/* 12. Notes */}
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label htmlFor="notes">Coach Notes / Recommendations</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Optional recommendations, progress remarks..."
                />
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
                  {isPending ? 'Saving...' : 'Save Measurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
