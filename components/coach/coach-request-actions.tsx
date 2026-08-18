'use client'

import { useState, useTransition } from 'react'
import { Check, X, UserCheck, AlertCircle } from 'lucide-react'
import { acceptClientRequestAction, declineClientRequestAction } from '@/app/coach/requests/actions'

export function CoachRequestActions({ requestId, clientName }: { requestId: string; clientName: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'accepted' | 'declined'>('idle')

  const handleAccept = () => {
    setError(null)
    startTransition(async () => {
      const res = await acceptClientRequestAction(requestId)
      if (res.success) {
        setStatus('accepted')
      } else {
        setError(res.error)
      }
    })
  }

  const handleDecline = () => {
    setError(null)
    startTransition(async () => {
      const res = await declineClientRequestAction(requestId)
      if (res.success) {
        setStatus('declined')
      } else {
        setError(res.error)
      }
    })
  }

  if (status === 'accepted') {
    return (
      <div className="badge badge-success" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
        <Check size={14} /> Accepted as Your Client!
      </div>
    )
  }

  if (status === 'declined') {
    return (
      <div className="badge badge-error" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
        <X size={14} /> Request Declined
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--status-error-text)' }}>
          {error}
        </span>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={handleDecline}
          disabled={isPending}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--status-error-text)', borderColor: 'var(--status-error-border)' }}
        >
          <X size={14} /> Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={isPending}
          className={`btn btn-primary btn-sm ${isPending ? 'btn-loading' : ''}`}
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#15803d' }}
        >
          {!isPending && <Check size={14} />} Accept Client
        </button>
      </div>
    </div>
  )
}
