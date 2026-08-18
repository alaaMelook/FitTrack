'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const ROLE_HOME: Record<string, string> = {
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  client: '/client/dashboard',
}

export type LoginState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
  }
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Validate inputs
  const validation = LoginSchema.safeParse({ email, password })
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  // 2. Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[Server Login Error]', error)
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Incorrect email or password. Please try again.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'Please confirm your email address before signing in.' }
    }
    return { success: false, error: error.message || 'Authentication failed. Please check your credentials.' }
  }

  if (!data.user) {
    return { success: false, error: 'User account not found.' }
  }

  // 3. Fetch user role from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()

  if (profile && !profile.is_active) {
    await supabase.auth.signOut()
    return { success: false, error: 'This account has been deactivated. Please contact your administrator.' }
  }

  const userRole = (profile?.role || data.user.user_metadata?.role || 'client') as string
  const destination = ROLE_HOME[userRole] || '/login'

  // 4. Redirect to role dashboard
  redirect(destination)
}
