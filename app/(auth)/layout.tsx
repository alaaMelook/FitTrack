import type { Metadata } from 'next'
import styles from './auth.module.css'
import { Sparkles, Dumbbell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In — FitTrack',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.shell}>
      {/* Left panel — branding & inspiration */}
      <div className={styles.branding}>
        <div className={styles.brandingInner}>
          <div className={styles.logo}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              <Dumbbell size={24} />
            </div>
            <span className={styles.logoText}>FitTrack</span>
          </div>

          <div className={styles.taglineSection} style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
            <h1 className={styles.tagline} style={{ fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 800 }}>
              Your Journey <br />
              Starts Here.
            </h1>
            <p className={styles.taglineSubtext} style={{ fontSize: '1.05rem', lineHeight: 1.7, marginTop: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              Transform your body, stay disciplined, and become the strongest version of yourself.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              maxWidth: 380,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-300)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>
              <Sparkles size={16} /> Power Gym Community
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: 0 }}>
              &quot;Consistency is the bridge between goals and accomplishment.&quot;
            </p>
          </div>
        </div>

        {/* Decorative glow */}
        <div className={styles.glow1} aria-hidden="true" />
        <div className={styles.glow2} aria-hidden="true" />
      </div>

      {/* Right panel — form */}
      <div className={styles.formPanel}>
        <div className={styles.formPanelInner}>{children}</div>
      </div>
    </div>
  )
}
