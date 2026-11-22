'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/activity-logger'

export async function createInvitationAction(prevState: any, formData: FormData) {
  try {
    const session = await requireAdmin()
    const supabase = await createClient()

    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const role = (formData.get('role') as string) || 'coach'

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' }
    }

    // Get gym ID
    const { data: adminRow } = await supabase
      .from('admins')
      .select('gym_id')
      .eq('user_id', session.id)
      .single()

    const gymId = adminRow?.gym_id || 'a0000000-0000-0000-0000-000000000001'

    const { data: invitation, error: insertError } = await supabase
      .from('client_invitations')
      .insert({
        gym_id: gymId,
        invited_by_user_id: session.id,
        email: email,
        role: role as 'coach' | 'client',
        status: 'pending',
      })
      .select('id, token')
      .single()

    if (insertError) {
      console.error('Insert invitation error:', insertError)
      return { success: false, error: insertError.message }
    }

    // Log this event
    await logActivity({
      actorUserId: session.id,
      action: `Sent ${role} invitation to ${email}`,
      entityType: 'invitation',
      entityId: invitation.id,
      metadata: { email, role },
    })

    // Dynamically resolve base URL from the incoming request headers (works on Vercel & localhost automatically)
    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000'
    const proto = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const origin = `${proto}://${host}`

    const inviteUrl = `${origin}/register/${invitation.token}`

    revalidatePath('/admin/invitations')
    revalidatePath('/admin/activity-logs')
    return {
      success: true,
      error: null,
      inviteUrl,
    }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'Failed to create invitation.' }
  }
}

export async function deleteInvitationAction(formData: FormData) {
  try {
    const session = await requireAdmin()
    const db: any = createAdminClient()
    const id = String(formData.get('id') ?? '').trim()

    if (!id) return

    // Fetch invitation to log details
    const { data: inv } = await db.from('client_invitations').select('email, role').eq('id', id).maybeSingle()

    const { error } = await db.from('client_invitations').delete().eq('id', id)
    if (error) {
      console.error('Delete invitation error:', error)
      return
    }

    await logActivity({
      actorUserId: session.id,
      action: `Deleted ${inv?.role || ''} invitation for ${inv?.email || id}`.trim(),
      entityType: 'invitation',
      entityId: id,
      metadata: { email: inv?.email, role: inv?.role },
    })

    revalidatePath('/admin/invitations')
    revalidatePath('/admin/activity-logs')
  } catch (err) {
    console.error('Delete invitation action error:', err)
  }
}
