import { requireAdmin } from '@/lib/auth/session'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { MobileShell } from '@/components/layout/mobile-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return (
    <MobileShell sidebar={<AdminSidebar user={session} />}>
      {children}
    </MobileShell>
  )
}
