'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function addAdminMembershipAction(prevState: any, formData: FormData) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    const clientId = formData.get('clientId') as string
    const planName = (formData.get('planName') as string)?.trim() || 'Gym Membership'
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    if (!clientId) {
      return { success: false, error: 'Please select a client.' }
    }
    if (!endDate) {
      return { success: false, error: 'End Date is required to set membership validity.' }
    }

    const { data: adminRow } = await adminSupabase
      .from('admins')
      .select('gym_id')
      .eq('user_id', session.id)
      .single()

    const gymId = adminRow?.gym_id || 'a0000000-0000-0000-0000-000000000001'

    const { error: insertErr } = await adminSupabase.from('memberships').insert({
      client_id: clientId,
      gym_id: gymId,
      created_by_user_id: session.id,
      plan_name: planName,
      price_paid: 0,
      currency: 'EGP',
      start_date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate,
      payment_method: 'standard',
    })

    if (insertErr) {
      console.error('Insert membership error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    revalidatePath('/admin/memberships')
    revalidatePath('/admin/clients')
    revalidatePath('/client/dashboard')
    revalidatePath('/client/my-membership')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An error occurred while creating the membership.' }
  }
}
