import type { Metadata } from 'next'
import styles from './auth.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.shell}>
      {/* Left panel — branding */}
      <div className={styles.branding}>
        <div className={styles.brandingInner}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect width="40" height="40" rx="12" fill="url(#grad)" />
              <path d="M10 20h4M26 20h4M14 20v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6M14 20v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6M14 20h12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22c55e"/>
                  <stop offset="1" stopColor="#15803d"/>
                </linearGradient>
              </defs>
            </svg>
            <span className={styles.logoText}>FitTrack</span>
          </div>

          <div className={styles.taglineSection}>
            <h1 className={styles.tagline}>Transform bodies.<br/>Track progress.<br/>Build futures.</h1>
            <p className={styles.taglineSubtext}>
              The complete gym management platform for modern fitness professionals.
            </p>
          </div>

          <div className={styles.features}>
            {[
              { icon: '📊', text: 'Real-time progress tracking' },
              { icon: '🏋️', text: 'Coach & client management' },
              { icon: '📅', text: 'Membership lifecycle' },
              { icon: '📸', text: 'Secure progress photos' },
            ].map((f) => (
              <div key={f.text} className={styles.feature}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
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
