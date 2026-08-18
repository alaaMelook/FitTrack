'use server'

import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function addClientMembershipAction(prevState: any, formData: FormData) {
  try {
    const session = await requireClient()
    const supabase = await createClient()

    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string
    const planName = (formData.get('planName') as string) || 'Gym Access Membership'
    const pricePaidStr = formData.get('pricePaid') as string
    const paymentMethod = (formData.get('paymentMethod') as string) || 'Cash at Reception'
    const notes = (formData.get('notes') as string) || null

    if (!endDateStr) {
      return { success: false, error: 'Please specify the membership end date (تاريخ انتهاء الاشتراك).' }
    }

    const startDate = startDateStr ? new Date(startDateStr) : new Date()
    const endDate = new Date(endDateStr)

    if (isNaN(endDate.getTime())) {
      return { success: false, error: 'Invalid end date format.' }
    }

    if (endDate <= startDate) {
      return { success: false, error: 'End date must be after the start date (تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء).' }
    }

    const pricePaid = pricePaidStr ? parseFloat(pricePaidStr) : 1000

    // Get client record
    const { data: clientRow } = await supabase
      .from('clients')
      .select('id, gym_id')
      .eq('user_id', session.id)
      .single()

    if (!clientRow) {
      return { success: false, error: 'Client profile not found.' }
    }

    const { error: insertErr } = await supabase.from('memberships').insert({
      gym_id: clientRow.gym_id,
      client_id: clientRow.id,
      created_by_user_id: session.id,
      plan_name: planName,
      price_paid: isNaN(pricePaid) ? 0 : pricePaid,
      currency: 'EGP',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      payment_method: paymentMethod,
      notes: notes,
    })

    if (insertErr) {
      console.error('Insert membership error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    revalidatePath('/client/my-membership')
    revalidatePath('/client/dashboard')
    revalidatePath('/admin/memberships')
    revalidatePath('/admin/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An error occurred while adding the membership.' }
  }
}
