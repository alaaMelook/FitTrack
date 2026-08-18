'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Fetch active coaches for the signup page (public)
export async function getAvailableCoaches() {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('coaches')
    .select(`
      id,
      bio,
      users ( full_name, email, avatar_url )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) return []
  return data ?? []
}

// Register a new client with self-signup
export async function registerClientAction(formData: FormData) {
  try {
    const adminSupabase = createAdminClient()

    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = (formData.get('fullName') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim() || null
    const gender = (formData.get('gender') as string) || null
    const dob = (formData.get('dateOfBirth') as string) || null
    const heightCm = formData.get('heightCm') ? parseFloat(formData.get('heightCm') as string) : null
    const coachId = (formData.get('coachId') as string) || null

    // Validation
    if (!email || !email.includes('@')) return { success: false, error: 'Please provide a valid email.' }
    if (!fullName || fullName.length < 2) return { success: false, error: 'Full name must be at least 2 characters.' }
    if (!phone) return { success: false, error: 'Phone number is required.' }
    if (!password || password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' }
    if (password !== confirmPassword) return { success: false, error: 'Passwords do not match.' }
    if (!coachId) return { success: false, error: 'Please select your coach.' }
    if (!gender || (gender !== 'male' && gender !== 'female')) return { success: false, error: 'Please select male or female gender.' }

    const defaultGymId = 'a0000000-0000-0000-0000-000000000001'

    // 1. Create auth user with email_confirm = true
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'client',
        phone: phone,
      },
    })

    let userId = authData?.user?.id

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' }
      }
      return { success: false, error: authError.message }
    }

    if (!userId) {
      return { success: false, error: 'Could not create account. Please try again.' }
    }

    // 2. Insert into public.users
    const { error: uErr } = await adminSupabase.from('users').upsert({
      id: userId,
      email: email,
      full_name: fullName,
      phone: phone,
      role: 'client',
      is_active: true,
    })

    if (uErr) {
      console.error('Error inserting public.user:', uErr)
    }

    // 3. Insert into public.clients
    const { data: clientRow, error: cErr } = await adminSupabase
      .from('clients')
      .upsert({
        user_id: userId,
        gym_id: defaultGymId,
        gender: gender as 'male' | 'female',
        date_of_birth: dob,
        height_cm: heightCm,
      })
      .select('id')
      .single()

    if (cErr) {
      console.error('Error inserting public.clients:', cErr)
    }

    // 4. Assign selected coach in coach_assignments
    if (clientRow?.id && coachId) {
      await adminSupabase.from('coach_assignments').insert({
        client_id: clientRow.id,
        coach_id: coachId,
        assigned_by_user_id: userId,
        started_at: new Date().toISOString(),
      })
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('registerClientAction error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred during registration.' }
  }
}
