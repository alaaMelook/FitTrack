'use server'

import { revalidatePath } from 'next/cache'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function acceptClientRequestAction(requestId: string) {
  try {
    const session = await requireCoach()
    const adminSupabase = createAdminClient()

    // 1. Get coach record for this user
    const { data: coachRow, error: coachErr } = await adminSupabase
      .from('coaches')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (coachErr || !coachRow) {
      return { success: false, error: 'Coach profile not found.' }
    }

    // 2. Fetch the change request
    const { data: req, error: reqErr } = await adminSupabase
      .from('coach_change_requests')
      .select('*')
      .eq('id', requestId)
      .eq('requested_coach_id', coachRow.id)
      .eq('status', 'pending')
      .single()

    if (reqErr || !req) {
      return { success: false, error: 'Request not found or already processed.' }
    }

    const nowIso = new Date().toISOString()

    // 3. End any existing active assignment for this client
    await adminSupabase
      .from('coach_assignments')
      .update({
        ended_at: nowIso,
        end_reason: 'Transferred to new coach upon acceptance',
      })
      .eq('client_id', req.client_id)
      .is('ended_at', null)

    // 4. Create new coach assignment
    const { error: assignErr } = await adminSupabase
      .from('coach_assignments')
      .insert({
        client_id: req.client_id,
        coach_id: coachRow.id,
        assigned_by_user_id: session.id,
        started_at: nowIso,
      })

    if (assignErr) {
      console.error('Error creating assignment:', assignErr)
      return { success: false, error: assignErr.message }
    }

    // 5. Update request status to approved
    await adminSupabase
      .from('coach_change_requests')
      .update({
        status: 'approved',
        reviewed_by_user_id: session.id,
        reviewed_at: nowIso,
        review_notes: 'Accepted and welcomed by coach',
      })
      .eq('id', req.id)

    revalidatePath('/coach/requests')
    revalidatePath('/coach/dashboard')
    revalidatePath('/coach/my-clients')
    revalidatePath('/client/my-coach')
    revalidatePath('/client/change-coach')
    revalidatePath('/client/dashboard')
    revalidatePath('/admin/change-requests')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('acceptClientRequestAction error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

export async function declineClientRequestAction(requestId: string, reviewNotes?: string) {
  try {
    const session = await requireCoach()
    const adminSupabase = createAdminClient()

    const { data: coachRow } = await adminSupabase
      .from('coaches')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (!coachRow) {
      return { success: false, error: 'Coach profile not found.' }
    }

    const { data: req } = await adminSupabase
      .from('coach_change_requests')
      .select('*')
      .eq('id', requestId)
      .eq('requested_coach_id', coachRow.id)
      .eq('status', 'pending')
      .single()

    if (!req) {
      return { success: false, error: 'Request not found or already processed.' }
    }

    const nowIso = new Date().toISOString()

    await adminSupabase
      .from('coach_change_requests')
      .update({
        status: 'rejected',
        reviewed_by_user_id: session.id,
        reviewed_at: nowIso,
        review_notes: reviewNotes || 'Declined by coach due to schedule/capacity',
      })
      .eq('id', req.id)

    revalidatePath('/coach/requests')
    revalidatePath('/coach/dashboard')
    revalidatePath('/client/change-coach')
    revalidatePath('/admin/change-requests')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('declineClientRequestAction error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
