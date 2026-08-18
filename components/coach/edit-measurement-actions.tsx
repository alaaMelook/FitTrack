'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, X, Check, AlertTriangle, Calendar } from 'lucide-react'
import { editMeasurementAction, deleteMeasurementAction } from '@/app/coach/my-clients/actions'

interface Measurement {
  id: string
  measured_at: string
  chest_cm: number | null
  arm_cm: number | null
  hips_cm: number | null
  waist_cm: number | null
  thigh_cm: number | null
  calf_cm?: number | null
  back_cm?: number | null
  weight_kg: number | null
  body_fat_pct: number | null
  muscle_mass_kg: number | null
  notes: string | null
}

export function EditMeasurementActions({ m, clientId }: { m: Measurement; clientId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = await deleteMeasurementAction(m.id, clientId)
      if (!res.success) setError(res.error ?? 'Error')
    })
  }

  if (isEditing) {
    return (
      <div className="modal-overlay">
        <div className="modal-dialog" style={{ maxWidth: 560 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Edit Measurement</h3>
            <button className="btn btn-ghost btn-icon" onClick={() => setIsEditing(false)}>
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="badge badge-error" style={{ width: '100%', marginBottom: '1rem', padding: '8px 12px' }}>
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              setError(null)
              startTransition(async () => {
                const res = await editMeasurementAction(null, fd)
                if (res.success) setIsEditing(false)
                else setError(res.error)
              })
            }}
          >
            <input type="hidden" name="measurementId" value={m.id} />
            <input type="hidden" name="clientId" value={clientId} />

            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor={`edit-date-${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--brand-700)' }}>
                <Calendar size={14} /> Measurement Date
              </label>
              <input
                id={`edit-date-${m.id}`}
                name="measuredAt"
                type="date"
                defaultValue={m.measured_at.split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Chest (cm)</label>
                <input name="chestCm" type="number" step="0.1" defaultValue={m.chest_cm ?? ''} placeholder="—" />
              </div>
              <div className="form-group">
                <label>Arm (cm)</label>
                <input name="armCm" type="number" step="0.1" defaultValue={m.arm_cm ?? ''} placeholder="—" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Glutes (cm)</label>
                <input name="glutesCm" type="number" step="0.1" defaultValue={m.hips_cm ?? ''} placeholder="—" />
              </div>
              <div className="form-group">
                <label>Abs (cm)</label>
                <input name="absCm" type="number" step="0.1" defaultValue={m.waist_cm ?? ''} placeholder="—" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Leg (cm)</label>
                <input name="legCm" type="number" step="0.1" defaultValue={m.thigh_cm ?? ''} placeholder="—" />
              </div>
              <div className="form-group">
                <label>Calf (cm)</label>
                <input name="calfCm" type="number" step="0.1" defaultValue={m.calf_cm ?? ''} placeholder="—" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Back (cm)</label>
                <input name="backCm" type="number" step="0.1" defaultValue={m.back_cm ?? ''} placeholder="—" />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input name="weightKg" type="number" step="0.1" defaultValue={m.weight_kg ?? ''} placeholder="—" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label>Body Fat (%)</label>
                <input name="bodyFatPct" type="number" step="0.1" defaultValue={m.body_fat_pct ?? ''} placeholder="—" />
              </div>
              <div className="form-group">
                <label>Muscle Mass (kg)</label>
                <input name="muscleMassKg" type="number" step="0.1" defaultValue={m.muscle_mass_kg ?? ''} placeholder="—" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Coach Notes</label>
              <textarea name="notes" rows={2} defaultValue={m.notes ?? ''} placeholder="Optional..." />
            </div>


            <div className="flex justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)} disabled={isPending}>
                Cancel
              </button>
              <button type="submit" className={`btn btn-primary btn-sm ${isPending ? 'btn-loading' : ''}`} disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        className="btn btn-ghost btn-icon"
        style={{ width: 28, height: 28, color: 'var(--brand-600)' }}
        title="Edit measurement"
        onClick={() => setIsEditing(true)}
      >
        <Pencil size={13} />
      </button>

      {showDelete ? (
        <>
          <button
            className="btn btn-sm"
            style={{ fontSize: 10, padding: '2px 8px', background: '#b91c1c', color: '#fff', border: 'none' }}
            onClick={handleDelete}
            disabled={isPending}
          >
            <AlertTriangle size={10} /> Delete
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 10, padding: '2px 8px' }}
            onClick={() => setShowDelete(false)}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          className="btn btn-ghost btn-icon"
          style={{ width: 28, height: 28, color: '#b91c1c' }}
          title="Delete measurement"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}
