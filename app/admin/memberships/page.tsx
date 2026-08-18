import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { CreditCard, Calendar } from 'lucide-react'
import { AddAdminMembershipModal } from '@/components/admin/add-admin-membership-modal'

export const metadata: Metadata = { title: 'Memberships — FitTrack' }

export default async function AdminMembershipsPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  // Fetch all clients for the modal dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id,
      users (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch all memberships with client & user details
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      id,
      plan_name,
      price_paid,
      currency,
      start_date,
      end_date,
      payment_method,
      created_at,
      clients (
        id,
        users (
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page-body animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>Memberships</h1>
          <p className="text-secondary text-sm">
            {memberships?.length ?? 0} total membership subscriptions
          </p>
        </div>

        <AddAdminMembershipModal clients={clients ?? []} />
      </div>

      {!memberships || memberships.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><CreditCard size={28} /></div>
          <p style={{ fontWeight: 600 }}>No memberships found</p>
          <p className="text-secondary text-sm">Add a new membership for any client to activate their account.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan Name</th>
                <th>Price Paid</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m: any) => {
                const clientUser = m.clients?.users
                const isActive = m.end_date >= today

                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                        {clientUser?.full_name ?? 'Client'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {clientUser?.email}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{m.plan_name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-700)' }}>
                      {m.price_paid} {m.currency}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>
                      {new Date(m.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>
                      {new Date(m.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={isActive ? 'badge badge-success' : 'badge badge-error'}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
