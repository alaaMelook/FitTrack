'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function resolveCoachChangeAction(
  requestId: string,
  decision: 'approved' | 'rejected',
  newCoachId?: string,
  reviewNotes?: string
) {
  try {
    const session = await requireAdmin()
    const supabase = await createClient()

    // Fetch the request
    const { data: req } = await supabase
      .from('coach_change_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!req) {
      return { success: false, error: 'Request not found.' }
    }

    if (decision === 'approved') {
      const targetCoachId = newCoachId || req.requested_coach_id

      if (!targetCoachId) {
        return { success: false, error: 'Please select a new coach to assign.' }
      }

      // 1. End existing assignment
      await supabase
        .from('coach_assignments')
        .update({
          ended_at: new Date().toISOString(),
          end_reason: 'Coach change requested and approved by admin',
        })
        .eq('client_id', req.client_id)
        .is('ended_at', null)

      // 2. Create new assignment
      const { error: newAssErr } = await supabase
        .from('coach_assignments')
        .insert({
          client_id: req.client_id,
          coach_id: targetCoachId,
          assigned_by_user_id: session.id,
          started_at: new Date().toISOString(),
        })

      if (newAssErr) {
        console.error('Error creating new assignment:', newAssErr)
        return { success: false, error: newAssErr.message }
      }
    }

    // 3. Update request status
    const { error: updateErr } = await supabase
      .from('coach_change_requests')
      .update({
        status: decision,
        reviewed_by_user_id: session.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || (decision === 'approved' ? 'Request approved.' : 'Request declined.'),
      })
      .eq('id', requestId)

    if (updateErr) {
      console.error('Error updating request:', updateErr)
      return { success: false, error: updateErr.message }
    }

    revalidatePath('/admin/change-requests')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/clients')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An error occurred.' }
  }
}
