'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toggleCoachVisibilityAction } from '@/app/admin/coaches/actions'

export function CoachVisibilityToggle({ coachId, initialIsActive }: { coachId: string; initialIsActive: boolean }) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const nextState = !isActive
    startTransition(async () => {
      const res = await toggleCoachVisibilityAction(coachId, nextState)
      if (res.success) {
        setIsActive(nextState)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="btn btn-ghost btn-sm"
      style={{
        fontSize: 'var(--text-xs)',
        padding: '4px 10px',
        color: isActive ? 'var(--brand-700)' : 'var(--text-muted)',
        border: '1px solid var(--border-subtle)',
        background: isActive ? 'rgba(140,86,212,0.06)' : 'var(--cream-300)',
      }}
      title={isActive ? 'Click to hide this coach from registration' : 'Click to make this coach visible for registration'}
    >
      {isActive ? (
        <>
          <Eye size={13} style={{ color: '#16a34a' }} /> Visible
        </>
      ) : (
        <>
          <EyeOff size={13} style={{ color: '#b91c1c' }} /> Hidden
        </>
      )}
    </button>
  )
}
