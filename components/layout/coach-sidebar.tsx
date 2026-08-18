'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  User,
  LogOut,
  Flame,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SessionUser } from '@/lib/auth/session'

const navItems = [
  { href: '/coach/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coach/my-clients', label: 'My Clients', icon: Users },
  { href: '/coach/requests', label: 'Client Requests', icon: UserCheck },
  { href: '/coach/profile', label: 'My Profile', icon: User },
]

export function CoachSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CO'

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: 'var(--space-6) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <Flame size={20} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', lineHeight: 1.1 }}>
            FitTrack
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-accent)', fontWeight: 600 }}>
            Coach Workspace
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: 'var(--space-4) var(--space-3)', flex: 1 }}>
        <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, padding: '0 var(--space-3)', marginBottom: 'var(--space-2)' }}>
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/coach/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', overflow: 'hidden' }}>
          <div className="avatar-fallback avatar-md" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: '#fff' }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }} className="truncate">
              {user.full_name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn btn-ghost btn-icon"
          title="Sign Out"
          aria-label="Sign Out"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}
