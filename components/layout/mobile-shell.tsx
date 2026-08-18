'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
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

      {/* ── Sidebar — adds .open on mobile when toggled ── */}
      <div className={`sidebar-wrapper ${isOpen ? 'open' : ''}`}>
        {sidebar}
      </div>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* Mobile top bar with hamburger */}
        <div className="mobile-topbar">
          <button
            className="menu-toggle"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {children}
      </main>
    </div>
  )
}
