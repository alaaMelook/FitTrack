'use client'

import { useState, useTransition } from 'react'
import { Trash2, UserX, UserCheck, AlertTriangle } from 'lucide-react'
import {
  deactivateClientAction,
  activateClientAction,
  deleteClientAction,
} from '@/app/admin/actions'

interface Props {
  clientId: string
  clientUserId: string
  isActive: boolean
  clientName: string
}

export function AdminClientActions({ clientId, clientUserId, isActive, clientName }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState<'deactivate' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggleActive = () => {
    setError(null)
    startTransition(async () => {
      const res = isActive
        ? await deactivateClientAction(clientUserId)
        : await activateClientAction(clientUserId)
      if (!res.success) setError(res.error)
    })
  }

  const handleHardDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = await deleteClientAction(clientUserId, clientId)
      if (!res.success) setError(res.error)
      else setShowConfirm(null)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: '#b91c1c', marginRight: 4 }}>{error}</span>
      )}

      {/* Deactivate / Activate */}
      {showConfirm === 'deactivate' ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn btn-sm"
            style={{ fontSize: 10, padding: '2px 8px', background: '#b91c1c', color: '#fff', border: 'none' }}
            onClick={handleToggleActive}
            disabled={isPending}
          >
            Confirm
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 10, padding: '2px 8px' }}
            onClick={() => setShowConfirm(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => isActive ? setShowConfirm('deactivate') : handleToggleActive()}
          disabled={isPending}
          title={isActive ? 'Deactivate account' : 'Reactivate account'}
          className="btn btn-ghost btn-icon"
          style={{ width: 30, height: 30, color: isActive ? '#d97706' : '#16a34a' }}
        >
          {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
        </button>
      )}

      {/* Hard Delete */}
      {showConfirm === 'delete' ? (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <AlertTriangle size={13} style={{ color: '#b91c1c' }} />
          <button
            className="btn btn-sm"
            style={{ fontSize: 10, padding: '2px 8px', background: '#b91c1c', color: '#fff', border: 'none' }}
            onClick={handleHardDelete}
            disabled={isPending}
          >
            Yes, delete
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 10, padding: '2px 8px' }}
            onClick={() => setShowConfirm(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm('delete')}
          disabled={isPending}
          title={`Permanently delete ${clientName}`}
          className="btn btn-ghost btn-icon"
          style={{ width: 30, height: 30, color: '#b91c1c' }}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}
