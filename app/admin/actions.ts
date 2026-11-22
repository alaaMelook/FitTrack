'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/activity-logger'

/** Soft-deactivate a client (set is_active = false on their user row) */
export async function deactivateClientAction(clientUserId: string) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('users')
      .update({ is_active: false })
      .eq('id', clientUserId)

    if (error) return { success: false, error: error.message }

    await logActivity({
      actorUserId: session.id,
      action: 'Deactivated client',
      entityType: 'client',
      targetUserId: clientUserId,
    })

    revalidatePath('/admin/clients')
    revalidatePath('/admin/activity-logs')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Reactivate a previously deactivated client */
export async function activateClientAction(clientUserId: string) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('users')
      .update({ is_active: true })
      .eq('id', clientUserId)

    if (error) return { success: false, error: error.message }

    await logActivity({
      actorUserId: session.id,
      action: 'Reactivated client',
      entityType: 'client',
      targetUserId: clientUserId,
    })

    revalidatePath('/admin/clients')
    revalidatePath('/admin/activity-logs')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Hard-delete a client — removes from auth.users (cascades to public tables via FK) */
export async function deleteClientAction(clientUserId: string, clientId: string) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    // Delete from auth.users → triggers cascade through all FK tables
    const { error: authErr } = await adminSupabase.auth.admin.deleteUser(clientUserId)
    if (authErr) return { success: false, error: authErr.message }

    await logActivity({
      actorUserId: session.id,
      action: 'Deleted client permanently',
      entityType: 'client',
      entityId: clientId,
      targetUserId: clientUserId,
    })

    revalidatePath('/admin/clients')
    revalidatePath('/admin/activity-logs')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Soft-deactivate a coach */
export async function deactivateCoachAction(coachId: string, coachUserId: string) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    await adminSupabase.from('coaches').update({ is_active: false }).eq('id', coachId)
    await adminSupabase.from('users').update({ is_active: false }).eq('id', coachUserId)

    await logActivity({
      actorUserId: session.id,
      action: 'Deactivated coach',
      entityType: 'coach',
      entityId: coachId,
      targetUserId: coachUserId,
    })

    revalidatePath('/admin/coaches')
    revalidatePath('/admin/activity-logs')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Reactivate a deactivated coach */
export async function activateCoachAction(coachId: string, coachUserId: string) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    await adminSupabase.from('coaches').update({ is_active: true }).eq('id', coachId)
    await adminSupabase.from('users').update({ is_active: true }).eq('id', coachUserId)

    await logActivity({
      actorUserId: session.id,
      action: 'Reactivated coach',
      entityType: 'coach',
      entityId: coachId,
      targetUserId: coachUserId,
    })

    revalidatePath('/admin/coaches')
    revalidatePath('/admin/activity-logs')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/** Hard-delete a coach */
export async function deleteCoachAction(coachUserId: string) {
  try {
    const session = await requireAdmin()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase.auth.admin.deleteUser(coachUserId)
    if (error) return { success: false, error: error.message }

    await logActivity({
      actorUserId: session.id,
      action: 'Deleted coach permanently',
      entityType: 'coach',
      targetUserId: coachUserId,
    })

    revalidatePath('/admin/coaches')
    revalidatePath('/admin/activity-logs')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
