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
  Salad,
  CalendarDays,
  Ruler,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

interface MobileShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function MobileShell({ sidebar, children }: MobileShellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
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

  const isAdmin  = pathname.startsWith('/admin')
  const isClient = pathname.startsWith('/client')
  const isCoach  = pathname.startsWith('/coach')

  const roleLabel = isAdmin ? 'Admin' : isClient ? 'Member' : isCoach ? 'Coach' : 'FitTrack'
  const RoleIcon  = isAdmin ? Shield : isClient ? HeartPulse : isCoach ? Flame : Dumbbell

  // ── Helper: active class ──────────────────────────────────────────────────
  const active = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

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

        {/* ─── Mobile Top Bar ────────────────────────────────────────────── */}
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

          {/* Online dot */}
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

        {/* ─────────────────────────── ADMIN BOTTOM NAV ───────────────────── */}
        {isAdmin && (
          <nav className="mobile-bottom-nav" aria-label="Admin quick navigation">
            <MobileNavItem href="/admin/dashboard" label="Home" icon={<LayoutDashboard size={21} />} isActive={active('/admin/dashboard', true)} />
            <MobileNavItem href="/admin/clients"   label="Clients" icon={<Users size={21} />} isActive={active('/admin/clients')} />
            <MobileNavItem href="/admin/coaches"   label="Coaches" icon={<UserCheck size={21} />} isActive={active('/admin/coaches')} />
            <MobileNavItem href="/admin/memberships" label="Members" icon={<CreditCard size={21} />} isActive={active('/admin/memberships')} />
            <MobileNavItem href="/admin/change-requests" label="Requests" icon={<RefreshCw size={21} />} isActive={active('/admin/change-requests')} />
          </nav>
        )}

        {/* ─────────────────────────── CLIENT BOTTOM NAV ──────────────────── */}
        {isClient && (
          <nav className="mobile-bottom-nav" aria-label="Client quick navigation">
            <MobileNavItem href="/client/dashboard"     label="Home"     icon={<LayoutDashboard size={21} />} isActive={active('/client/dashboard', true)} />
            <MobileNavItem href="/client/my-progress"   label="Progress" icon={<TrendingUp size={21} />}      isActive={active('/client/my-progress')} />
            <MobileNavItem href="/client/nutrition"     label="Nutrition" icon={<Salad size={21} />}          isActive={active('/client/nutrition')} />
            <MobileNavItem href="/client/workouts"      label="Workouts" icon={<Dumbbell size={21} />}        isActive={active('/client/workouts')} />
            <MobileNavItem href="/client/my-coach"      label="Coach"    icon={<UserCheck size={21} />}       isActive={active('/client/my-coach')} />
          </nav>
        )}

        {/* ─────────────────────────── COACH BOTTOM NAV ───────────────────── */}
        {isCoach && (
          <nav className="mobile-bottom-nav" aria-label="Coach quick navigation">
            <MobileNavItem href="/coach/dashboard"       label="Home"      icon={<LayoutDashboard size={21} />} isActive={active('/coach/dashboard', true)} />
            <MobileNavItem href="/coach/my-clients"      label="Clients"   icon={<Users size={21} />}            isActive={active('/coach/my-clients')} />
            <MobileNavItem href="/coach/programs"        label="Plans"     icon={<Salad size={21} />}            isActive={active('/coach/programs')} />
            <MobileNavItem href="/coach/workout-planner" label="Workouts"  icon={<CalendarDays size={21} />}     isActive={active('/coach/workout-planner')} />
            <MobileNavItem href="/coach/measurements"    label="Measures"  icon={<Ruler size={21} />}            isActive={active('/coach/measurements')} />
          </nav>
        )}

      </main>
    </div>
  )
}

// ── Reusable mobile nav item with pill indicator ──────────────────────────────
function MobileNavItem({
  href,
  label,
  icon,
  isActive,
}: {
  href: string
  label: string
  icon: React.ReactNode
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`mobile-nav-item ${isActive ? 'active' : ''}`}
      style={{ position: 'relative' }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 32,
          borderRadius: 20,
          background: isActive ? 'rgba(140, 86, 212, 0.14)' : 'transparent',
          transition: 'background 0.18s',
        }}
      >
        {icon}
        {isActive && (
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--brand-600)',
            }}
          />
        )}
      </div>
      <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 600 }}>{label}</span>
    </Link>
  )
}
