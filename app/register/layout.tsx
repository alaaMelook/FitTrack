import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Join FitTrack — Create Your Account',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #f5efeb 0%, #faf8f5 45%, #f2ebf8 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(140, 86, 212, 0.1)',
        }}
      >
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8c56d4, #5c2c99)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            F
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#1a1025' }}>
            FitTrack
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Already a member?</span>
          <Link href="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Centered Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '2.5rem 1rem 4rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 680,
            background: '#ffffff',
            borderRadius: 20,
            padding: '2.5rem 2.5rem',
            boxShadow: '0 10px 40px rgba(140, 86, 212, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(140,86,212,0.12)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
