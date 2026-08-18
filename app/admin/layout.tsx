import { requireAdmin } from '@/lib/auth/session'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return (
    <div className="app-shell">
      <AdminSidebar user={session} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
