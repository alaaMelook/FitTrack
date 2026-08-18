'use server'

import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function requestCoachChangeAction(prevState: any, formData: FormData) {
  try {
    const session = await requireClient()
    const supabase = await createClient()

    const reason = formData.get('reason') as string
    const preferredCoachId = (formData.get('preferredCoachId') as string) || null

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'Please provide a clear reason for requesting a change (at least 5 characters).' }
    }

    // Get client record
    const { data: clientRow } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (!clientRow) {
      return { success: false, error: 'Client profile not found.' }
    }

    // Get current active assignment
    const { data: assignment } = await supabase
      .from('coach_assignments')
      .select('coach_id')
      .eq('client_id', clientRow.id)
      .is('ended_at', null)
      .single()

    if (!assignment) {
      return { success: false, error: 'You do not have an active coach assigned.' }
    }

    // Check for existing pending request
    const { data: pendingReq } = await supabase
      .from('coach_change_requests')
      .select('id')
      .eq('client_id', clientRow.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (pendingReq) {
      return { success: false, error: 'You already have a pending coach change request under review by the admin.' }
    }

    const { error: insertErr } = await supabase
      .from('coach_change_requests')
      .insert({
        client_id: clientRow.id,
        current_coach_id: assignment.coach_id,
        requested_coach_id: preferredCoachId || null,
        reason: reason.trim(),
        status: 'pending',
      })

    if (insertErr) {
      console.error('Insert change request error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    revalidatePath('/client/change-coach')
    revalidatePath('/client/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An error occurred while submitting your request.' }
  }
}
