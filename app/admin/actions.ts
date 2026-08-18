'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/** Soft-deactivate a client (set is_active = false on their user row) */
export async function deactivateClientAction(clientUserId: string) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('users')
      .update({ is_active: false })
      .eq('id', clientUserId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/clients')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Reactivate a previously deactivated client */
export async function activateClientAction(clientUserId: string) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('users')
      .update({ is_active: true })
      .eq('id', clientUserId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/clients')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Hard-delete a client — removes from auth.users (cascades to public tables via FK) */
export async function deleteClientAction(clientUserId: string, clientId: string) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    // Delete from auth.users → triggers cascade through all FK tables
    const { error: authErr } = await adminSupabase.auth.admin.deleteUser(clientUserId)
    if (authErr) return { success: false, error: authErr.message }

    revalidatePath('/admin/clients')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Soft-deactivate a coach */
export async function deactivateCoachAction(coachId: string, coachUserId: string) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    await adminSupabase.from('coaches').update({ is_active: false }).eq('id', coachId)
    await adminSupabase.from('users').update({ is_active: false }).eq('id', coachUserId)

    revalidatePath('/admin/coaches')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Reactivate a deactivated coach */
export async function activateCoachAction(coachId: string, coachUserId: string) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    await adminSupabase.from('coaches').update({ is_active: true }).eq('id', coachId)
    await adminSupabase.from('users').update({ is_active: true }).eq('id', coachUserId)

    revalidatePath('/admin/coaches')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Hard-delete a coach */
export async function deleteCoachAction(coachUserId: string) {
  try {
    await requireAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase.auth.admin.deleteUser(coachUserId)
    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/coaches')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
