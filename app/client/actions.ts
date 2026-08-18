'use server'

import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateClientGoalsAndNotesAction(prevState: any, formData: FormData) {
  try {
    const session = await requireClient()
    const adminSupabase = createAdminClient()

    const notes = (formData.get('notes') as string)?.trim() || null

    const { error } = await adminSupabase
      .from('clients')
      .update({
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.id)

    if (error) {
      console.error('Update client goals error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/client/dashboard')
    revalidatePath('/client/my-progress')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'Failed to update goals and notes.' }
  }
}

