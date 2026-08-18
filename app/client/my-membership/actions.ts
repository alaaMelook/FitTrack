'use server'

import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function addClientMembershipAction(prevState: any, formData: FormData) {
  try {
    const session = await requireClient()
    const supabase = await createClient()

    const planName = (formData.get('planName') as string)?.trim() || 'Gym Membership'
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    if (!endDate) {
      return { success: false, error: 'End Date is required to set membership validity.' }
    }

    // Get client record
    const { data: clientRow } = await supabase
      .from('clients')
      .select('id, gym_id')
      .eq('user_id', session.id)
      .single()

    if (!clientRow) {
      return { success: false, error: 'Client record not found.' }
    }

    const defaultGymId = clientRow.gym_id || 'a0000000-0000-0000-0000-000000000001'

    const { error: insertErr } = await supabase.from('memberships').insert({
      client_id: clientRow.id,
      gym_id: defaultGymId,
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

    revalidatePath('/client/my-membership')
    revalidatePath('/client/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An error occurred while saving your membership.' }
  }
}
