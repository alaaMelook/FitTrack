import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole, UserRow } from '@/lib/supabase/types'

export type SessionUser = {
  id: string
  email: string
  role: UserRole
  full_name: string
  is_active: boolean
}

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  client: '/client/dashboard',
}

/**
 * Returns the current authenticated user from the DB public.users table.
 * Returns null if not authenticated or user is inactive.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, role, full_name, is_active')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null
  const userProfile = profile as unknown as UserRow
  if (!userProfile.is_active) return null

  return {
    id: userProfile.id,
    email: userProfile.email,
    role: userProfile.role,
    full_name: userProfile.full_name,
    is_active: userProfile.is_active,
  }
}

/**
 * Requires authentication. Redirects to /login if not authenticated.
 * Returns the session user.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/**
 * Requires a specific role. Redirects to their home if wrong role.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== role) {
    redirect(ROLE_HOME[session.role])
  }
  return session
}

/**
 * Requires admin role.
 */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('admin')
}

/**
 * Requires coach role.
 */
export async function requireCoach(): Promise<SessionUser> {
  return requireRole('coach')
}

/**
 * Requires client role.
 */
export async function requireClient(): Promise<SessionUser> {
  return requireRole('client')
}

/**
 * Checks if the current user is an admin (without redirecting).
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.role === 'admin'
}
