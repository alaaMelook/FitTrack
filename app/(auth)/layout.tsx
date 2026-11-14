'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './auth.module.css'
import { Sparkles, Dumbbell } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  return (
    <div className={styles.shell}>
      <div className={styles.branding}>
        <div className={styles.brandingInner}>
          <div className={styles.logo}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--shadow-brand)' }}>
              <Dumbbell size={24} />
            </div>
            <span className={styles.logoText}>FitTrack</span>
          </div>
          <div className={styles.taglineSection} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <h1 className={styles.tagline} style={{ fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 800, color: 'var(--text-primary)' }}>
              Your Journey <br />Starts Here.
            </h1>
            <p className={styles.taglineSubtext} style={{ fontSize: '1.05rem', lineHeight: 1.7, marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Build healthy habits, track your progress, and become stronger at your own pace.
            </p>
          </div>
          <div className={styles.quoteCard} style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-xl)', background: '#ffffff', border: '1.5px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-700)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>
              <Sparkles size={16} /> FitTrack Community
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              &quot;Consistency is the bridge between goals and accomplishment.&quot;
            </p>
          </div>
        </div>
        <div className={styles.glow1} aria-hidden="true" />
        <div className={styles.glow2} aria-hidden="true" />
      </div>
      <div className={styles.formPanel}>
        <div className={styles.formPanelInner}>{children}</div>
      </div>
    </div>
  )
}
