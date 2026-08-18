'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleCoachVisibilityAction(coachId: string, makeVisible: boolean) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    if (!coachId) {
      return { success: false, error: 'Coach ID is required.' }
    }

    const { error: updateErr } = await adminSupabase
      .from('coaches')
      .update({
        is_active: makeVisible,
        updated_at: new Date().toISOString(),
      })
      .eq('id', coachId)

    if (updateErr) {
      console.error('Toggle coach visibility error:', updateErr)
      return { success: false, error: updateErr.message }
    }

    revalidatePath('/admin/coaches')
    revalidatePath('/register')
    revalidatePath('/client/change-coach')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('toggleCoachVisibilityAction error:', err)
    return { success: false, error: err.message || 'An error occurred while updating coach visibility.' }
  }
}
