import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

const ROLE_HOME: Record<string, string> = {
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  client: '/client/dashboard',
}

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  redirect(ROLE_HOME[session.role] ?? '/login')
}
