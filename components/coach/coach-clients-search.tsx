'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Users, Phone, Mail } from 'lucide-react'
import { AddMeasurementModal } from '@/components/coach/add-measurement-modal'

interface ClientItem {
  assignmentId: string
  startedAt: string
  client: {
    id: string
    gender: string | null
    height_cm: number | null
    users: {
      full_name: string | null
      email: string | null
      phone: string | null
    } | null
  }
}

export function CoachClientsSearch({ clients }: { clients: ClientItem[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return clients

    return clients.filter((c) => {
      const name = c.client?.users?.full_name?.toLowerCase() || ''
      const phone = c.client?.users?.phone?.toLowerCase() || ''
      const email = c.client?.users?.email?.toLowerCase() || ''
      return name.includes(term) || phone.includes(term) || email.includes(term)
    })
  }, [clients, searchTerm])

  return (
    <div>
      {/* Search Input Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients by name or phone number..."
            style={{
              paddingLeft: 42,
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
            }}
          />
        </div>
        {searchTerm && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Found {filteredClients.length} of {clients.length} clients
          </span>
        )}
      </div>

      {/* Grid or Empty */}
      {filteredClients.length === 0 ? (
        <div className="card empty-state" style={{ padding: 'var(--space-10)' }}>
          <div className="empty-icon"><Users size={28} /></div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {searchTerm ? 'No clients match your search' : 'No clients assigned yet'}
          </p>
          <p className="text-secondary text-sm">
            {searchTerm ? 'Try searching with another name or phone number.' : 'Ask your gym administrator to assign clients.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
          {filteredClients.map((a) => {
            const client = a.client
            const user = client?.users
            const initials = user?.full_name
              ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : 'CL'

            return (
              <div key={a.assignmentId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Link
                  href={`/coach/my-clients/${client?.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div
                      className="avatar-fallback"
                      style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                        color: '#fff',
                        fontSize: 'var(--text-base)',
                        fontWeight: 700,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }} className="truncate">
                        {user?.full_name ?? 'Client'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">
                        {user?.email ?? '—'}
                      </div>
                      {user?.phone && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Phone size={11} /> {user.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {client?.gender && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Gender</span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{client.gender}</span>
                      </div>
                    )}
                    {client?.height_cm && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Height</span>
                        <span style={{ fontWeight: 600 }}>{client.height_cm} cm</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned</span>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(a.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Footer Actions */}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AddMeasurementModal clientId={client?.id} />
                  <Link
                    href={`/coach/my-clients/${client?.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    View Profile <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
