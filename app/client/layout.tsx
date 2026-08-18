import { requireClient } from '@/lib/auth/session'
import { ClientSidebar } from '@/components/layout/client-sidebar'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireClient()

  return (
    <div className="app-shell">
      <ClientSidebar user={session} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
