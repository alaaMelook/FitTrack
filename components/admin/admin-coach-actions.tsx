'use client'

import { useState, useTransition } from 'react'
import { Trash2, UserX, UserCheck, AlertTriangle } from 'lucide-react'
import {
  deactivateCoachAction,
  activateCoachAction,
  deleteCoachAction,
} from '@/app/admin/actions'

interface Props {
  coachId: string
  coachUserId: string
  isActive: boolean
  coachName: string
}

export function AdminCoachActions({ coachId, coachUserId, isActive, coachName }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState<'deactivate' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggleActive = () => {
    setError(null)
    startTransition(async () => {
      const res = isActive
        ? await deactivateCoachAction(coachId, coachUserId)
        : await activateCoachAction(coachId, coachUserId)
      if (!res.success) setError(res.error)
      else setShowConfirm(null)
    })
  }

  const handleHardDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = await deleteCoachAction(coachUserId)
      if (!res.success) setError(res.error)
      else setShowConfirm(null)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: '#b91c1c', width: '100%' }}>{error}</span>
      )}

      {showConfirm === 'deactivate' ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn btn-sm"
            style={{ fontSize: 10, padding: '3px 10px', background: '#b91c1c', color: '#fff', border: 'none' }}
            onClick={handleToggleActive}
            disabled={isPending}
          >
            Confirm
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 10, padding: '3px 10px' }}
            onClick={() => setShowConfirm(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => isActive ? setShowConfirm('deactivate') : handleToggleActive()}
          disabled={isPending}
          title={isActive ? 'Deactivate coach' : 'Reactivate coach'}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 11, padding: '4px 10px', color: isActive ? '#d97706' : '#16a34a' }}
        >
          {isActive ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Reactivate</>}
        </button>
      )}

      {showConfirm === 'delete' ? (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <AlertTriangle size={12} style={{ color: '#b91c1c' }} />
          <button
            className="btn btn-sm"
            style={{ fontSize: 10, padding: '3px 10px', background: '#b91c1c', color: '#fff', border: 'none' }}
            onClick={handleHardDelete}
            disabled={isPending}
          >
            Yes, delete
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 10, padding: '3px 10px' }}
            onClick={() => setShowConfirm(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm('delete')}
          disabled={isPending}
          title={`Permanently delete ${coachName}`}
          className="btn btn-sm"
          style={{ fontSize: 11, padding: '4px 10px', color: '#b91c1c', border: '1px solid #fca5a5', background: '#fff1f2' }}
        >
          <Trash2 size={13} /> Delete
        </button>
      )}
    </div>
  )
}
