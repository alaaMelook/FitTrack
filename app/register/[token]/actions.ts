'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function registerCoachAction(formData: FormData) {
  try {
    const adminSupabase = createAdminClient()

    const token = formData.get('token') as string
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const fullName = (formData.get('fullName') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim() || null
    const bio = (formData.get('bio') as string)?.trim() || null
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!token) return { success: false, error: 'Invitation token is missing.' }
    if (!fullName || fullName.length < 2) return { success: false, error: 'Full name must be at least 2 characters.' }
    if (!password || password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' }
    if (password !== confirmPassword) return { success: false, error: 'Passwords do not match.' }

    // 1. Verify invitation token
    const { data: inv, error: invErr } = await adminSupabase
      .from('client_invitations')
      .select('*')
      .eq('token', token)
      .eq('role', 'coach')
      .single()

    if (invErr || !inv) {
      return { success: false, error: 'Invalid or expired coach invitation.' }
    }

    if (inv.status !== 'pending' || new Date(inv.expires_at) < new Date()) {
      return { success: false, error: 'This invitation has already been used or has expired.' }
    }

    // 2. Create user in Supabase Auth with email_confirm = true
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: inv.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'coach',
        phone: phone,
      },
    })

    let userId = authData?.user?.id

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        const { data: { users } } = await adminSupabase.auth.admin.listUsers()
        const existing = users.find((u) => u.email === inv.email)
        if (existing) {
          userId = existing.id
          await adminSupabase.auth.admin.updateUserById(existing.id, {
            password: password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: 'coach', phone: phone },
          })
        } else {
          return { success: false, error: authError.message }
        }
      } else {
        return { success: false, error: authError.message }
      }
    }

    if (!userId) {
      return { success: false, error: 'Could not create coach account. Please try again.' }
    }

    // 3. Upsert in public.users
    const { error: userErr } = await adminSupabase.from('users').upsert({
      id: userId,
      email: inv.email,
      full_name: fullName,
      phone: phone,
      role: 'coach',
      is_active: true,
    })

    if (userErr) {
      console.error('Error upserting public.user:', userErr)
    }

    // 4. Upsert in public.coaches
    const { error: coachErr } = await adminSupabase.from('coaches').upsert({
      user_id: userId,
      gym_id: inv.gym_id,
      bio: bio,
      is_active: true,
    })

    if (coachErr) {
      console.error('Error upserting public.coaches:', coachErr)
    }

    // 5. Mark invitation as accepted
    await adminSupabase
      .from('client_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userId,
      })
      .eq('id', inv.id)

    return { success: true, error: null }
  } catch (err: any) {
    console.error('registerCoachAction error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
