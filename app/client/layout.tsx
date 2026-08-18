import { requireClient } from '@/lib/auth/session'
import { ClientSidebar } from '@/components/layout/client-sidebar'
import { MobileShell } from '@/components/layout/mobile-shell'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireClient()

  return (
    <MobileShell sidebar={<ClientSidebar user={session} />}>
      {children}
    </MobileShell>
  )
}
