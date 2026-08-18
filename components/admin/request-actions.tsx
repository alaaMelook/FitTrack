'use client'

import { useState, useTransition } from 'react'
import { Check, X } from 'lucide-react'
import { resolveCoachChangeAction } from '@/app/admin/change-requests/actions'

export function RequestActions({
  requestId,
  requestedCoachId,
  availableCoaches,
}: {
  requestId: string
  requestedCoachId: string | null
  availableCoaches: Array<{ id: string; name: string }>
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedCoach, setSelectedCoach] = useState(requestedCoachId || availableCoaches[0]?.id || '')

  const handleDecision = (decision: 'approved' | 'rejected') => {
    startTransition(async () => {
      await resolveCoachChangeAction(requestId, decision, selectedCoach)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      <select
        value={selectedCoach}
        onChange={(e) => setSelectedCoach(e.target.value)}
        disabled={isPending}
        style={{ fontSize: 'var(--text-xs)', padding: '4px 8px', width: 'auto' }}
      >
        {availableCoaches.map((c) => (
          <option key={c.id} value={c.id}>
            Assign to: {c.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => handleDecision('approved')}
        className={`btn btn-primary btn-sm ${isPending ? 'btn-loading' : ''}`}
        disabled={isPending}
        title="Approve & Reassign"
      >
        <Check size={14} /> Approve
      </button>

      <button
        type="button"
        onClick={() => handleDecision('rejected')}
        className="btn btn-danger btn-sm"
        disabled={isPending}
        title="Reject Request"
      >
        <X size={14} /> Reject
      </button>
    </div>
  )
}
