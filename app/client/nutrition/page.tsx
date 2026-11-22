import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { NutritionPlanView } from '@/components/programs/program-views'
import { Salad } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My Nutrition Plan — FitTrack' }

export default async function ClientNutritionPage() {
  const session = await requireClient()
  const db: any = createAdminClient()

  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('user_id', session.id)
    .maybeSingle()

  const { data: plans } = client
    ? await db
        .from('nutrition_plans')
        .select('id, title, notes, meals, updated_at')
        .eq('client_id', client.id)
        .order('updated_at', { ascending: false })
    : { data: [] }

  return (
    <main className="page-body animate-fade-in">
      <header
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #16a34a, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
            flexShrink: 0,
          }}
        >
          <Salad size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Nutrition Plan
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
            Your assigned meal routines, food portions, and coach guidelines.
          </p>
        </div>
      </header>

      <NutritionPlanView plans={plans ?? []} />
    </main>
  )
}
