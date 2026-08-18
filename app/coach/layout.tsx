import { requireCoach } from '@/lib/auth/session'
import { CoachSidebar } from '@/components/layout/coach-sidebar'
import { MobileShell } from '@/components/layout/mobile-shell'

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireCoach()

  return (
    <MobileShell sidebar={<CoachSidebar user={session} />}>
      {children}
    </MobileShell>
  )
}
