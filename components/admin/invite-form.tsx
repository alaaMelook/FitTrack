'use client'

import { useState, useTransition } from 'react'
import { Dumbbell, Send, Copy, Check } from 'lucide-react'
import { createInvitationAction } from '@/app/admin/invitations/actions'

export function InviteForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setInviteUrl(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const res = await createInvitationAction(null, formData)
      if (res.success && res.inviteUrl) {
        setInviteUrl(res.inviteUrl)
        form.reset()
      } else {
        setError(res.error)
      }
    })
  }

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
        <Dumbbell size={18} style={{ color: 'var(--brand-600)' }} />
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Invite a New Coach</h3>
      </div>
      <p className="text-secondary text-xs" style={{ marginBottom: '1.25rem' }}>
        Clients can register directly from the sign-up page. Invitations are reserved for coaches only.
      </p>

      {error && (
        <div className="badge badge-error" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {inviteUrl && (
        <div style={{ background: 'var(--cream-300)', border: '1.5px solid var(--border-brand)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--brand-700)', marginBottom: 4 }}>
            ✅ Coach Invitation Generated!
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Copy and send this unique registration link to the user:
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              style={{ fontSize: 'var(--text-xs)', background: '#fff' }}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hidden role: always coach */}
        <input type="hidden" name="role" value="coach" />

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="email">Coach Email Address *</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="coach@example.com"
            required
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${isPending ? 'btn-loading' : ''}`}
          disabled={isPending}
        >
          <Send size={16} /> {isPending ? 'Generating...' : 'Generate Coach Invite Link'}
        </button>
      </form>
    </div>
  )
}
