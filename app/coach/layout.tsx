import { requireCoach } from '@/lib/auth/session'
import { CoachSidebar } from '@/components/layout/coach-sidebar'

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireCoach()

  return (
    <div className="app-shell">
      <CoachSidebar user={session} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
