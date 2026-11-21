import type { Metadata } from 'next'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { NutritionPlanView } from '@/components/programs/program-views'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My Nutrition — FitTrack' }
export default async function ClientNutritionPage() { const session = await requireClient(); const db: any = createAdminClient(); const { data: client } = await db.from('clients').select('id').eq('user_id', session.id).maybeSingle(); const { data: plans } = client ? await db.from('nutrition_plans').select('id,title,notes,meals,updated_at').eq('client_id', client.id).order('updated_at', { ascending: false }) : { data: [] }; return <main className="page-body animate-fade-in"><header style={{ marginBottom: 'var(--space-6)' }}><h1 style={{ fontSize: 'var(--text-3xl)' }}>My Nutrition Plan</h1><p className="text-secondary">Your assigned meals, portions, calories, and macronutrients.</p></header><NutritionPlanView plans={plans ?? []} /></main> }
