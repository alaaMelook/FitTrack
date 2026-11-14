import type { Metadata } from 'next'
import { UserPlus } from 'lucide-react'
import { ClientRegisterForm } from './client-register-form'
import styles from './register.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Join FitTrack — Create Your Account',
  description: 'Create a FitTrack account and start your fitness journey.',
}

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      <div className={styles.heading}>
        <span className={styles.headingIcon} aria-hidden="true"><UserPlus size={20} /></span>
        <p className={styles.eyebrow}>Quick setup · About 2 minutes</p>
        <h1 id="register-title">Create your account</h1>
        <p className={styles.intro}>Enter your details, choose a coach, and you’re ready to get started.</p>
      </div>
      <ClientRegisterForm />
    </div>
  )
}
