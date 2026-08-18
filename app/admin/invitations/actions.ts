'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function createInvitationAction(prevState: any, formData: FormData) {
  try {
    const session = await requireAdmin()
    const supabase = await createClient()

    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const role = (formData.get('role') as string) || 'client'

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' }
    }

    if (role !== 'client' && role !== 'coach') {
      return { success: false, error: 'Invalid role selected.' }
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
      .select('token')
      .single()

    if (insertError) {
      console.error('Insert invitation error:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath('/admin/invitations')
    return {
      success: true,
      error: null,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/${invitation.token}`,
    }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'Failed to create invitation.' }
  }
}
