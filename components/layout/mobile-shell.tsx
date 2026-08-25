'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Dumbbell,
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  RefreshCw,
  User,
  Shield,
  HeartPulse,
  Flame,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

interface MobileShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function MobileShell({ sidebar, children }: MobileShellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile nav after tap)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Determine portal role & icon for header and bottom navigation
  const isAdmin = pathname.startsWith('/admin')
  const isClient = pathname.startsWith('/client')
  const isCoach = pathname.startsWith('/coach')

  const roleLabel = isAdmin ? 'Admin' : isClient ? 'Member' : isCoach ? 'Coach' : 'FitTrack'
  const RoleIcon = isAdmin ? Shield : isClient ? HeartPulse : isCoach ? Flame : Dumbbell

  return (
    <div className="app-shell">
      {/* ── Mobile Overlay ── */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Drawer ── */}
      <div className={`sidebar-wrapper ${isOpen ? 'open' : ''}`}>
        {sidebar}
      </div>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* Mobile top bar */}
        <header className="mobile-topbar">
          <button
            className="menu-toggle"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              <RoleIcon size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-base)', lineHeight: 1.1, color: 'var(--text-primary)' }}>
                FitTrack
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-700)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {roleLabel} Portal
              </span>
            </div>
          </div>

          <div style={{ width: 42, display: 'flex', justifyContent: 'flex-end' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#16a34a',
                boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
              }}
              title="Online & Synced"
            />
          </div>
        </header>

        {children}

        {/* ── Mobile Bottom Navigation Bar ── */}
        {isAdmin && (
          <nav className="mobile-bottom-nav" aria-label="Admin quick navigation">
            <Link
              href="/admin/dashboard"
              className={`mobile-nav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/clients"
              className={`mobile-nav-item ${pathname.startsWith('/admin/clients') ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Clients</span>
            </Link>
            <Link
              href="/admin/coaches"
              className={`mobile-nav-item ${pathname.startsWith('/admin/coaches') ? 'active' : ''}`}
            >
              <UserCheck size={20} />
              <span>Coaches</span>
            </Link>
            <Link
              href="/admin/memberships"
              className={`mobile-nav-item ${pathname.startsWith('/admin/memberships') ? 'active' : ''}`}
            >
              <CreditCard size={20} />
              <span>Members</span>
            </Link>
            <Link
              href="/admin/change-requests"
              className={`mobile-nav-item ${pathname.startsWith('/admin/change-requests') ? 'active' : ''}`}
            >
              <RefreshCw size={20} />
              <span>Requests</span>
            </Link>
          </nav>
        )}

        {isClient && (
          <nav className="mobile-bottom-nav" aria-label="Client quick navigation">
            <Link
              href="/client/dashboard"
              className={`mobile-nav-item ${pathname === '/client/dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Home</span>
            </Link>
            <Link
              href="/client/my-progress"
              className={`mobile-nav-item ${pathname.startsWith('/client/my-progress') ? 'active' : ''}`}
            >
              <TrendingUp size={20} />
              <span>Progress</span>
            </Link>
            <Link
              href="/client/my-membership"
              className={`mobile-nav-item ${pathname.startsWith('/client/my-membership') ? 'active' : ''}`}
            >
              <CreditCard size={20} />
              <span>Plan</span>
            </Link>
            <Link
              href="/client/my-coach"
              className={`mobile-nav-item ${pathname.startsWith('/client/my-coach') ? 'active' : ''}`}
            >
              <UserCheck size={20} />
              <span>Coach</span>
            </Link>
          </nav>
        )}

        {isCoach && (
          <nav className="mobile-bottom-nav" aria-label="Coach quick navigation">
            <Link
              href="/coach/dashboard"
              className={`mobile-nav-item ${pathname === '/coach/dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Home</span>
            </Link>
            <Link
              href="/coach/my-clients"
              className={`mobile-nav-item ${pathname.startsWith('/coach/my-clients') ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Clients</span>
            </Link>
            <Link
              href="/coach/requests"
              className={`mobile-nav-item ${pathname.startsWith('/coach/requests') ? 'active' : ''}`}
            >
              <UserCheck size={20} />
              <span>Requests</span>
            </Link>
            <Link
              href="/coach/profile"
              className={`mobile-nav-item ${pathname.startsWith('/coach/profile') ? 'active' : ''}`}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
          </nav>
        )}
      </main>
    </div>
  )
}

