import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './register.module.css'

export const metadata: Metadata = {
  title: 'Join FitTrack — Create Your Account',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/login" className={styles.brand} aria-label="FitTrack home">
          <span className={styles.brandMark} aria-hidden="true">F</span>
          <span>FitTrack</span>
        </Link>
        <div className={styles.signInPrompt}>
          <span>Already have an account?</span>
          <Link href="/login" className="btn btn-secondary btn-sm">Sign in</Link>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="register-title">
          {children}
        </section>
      </main>
    </div>
  )
}
