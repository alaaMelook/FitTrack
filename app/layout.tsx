import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FitTrack — Gym Management Platform',
    template: '%s | FitTrack',
  },
  description:
    'FitTrack is a powerful gym management platform for admins, coaches, and clients. Track memberships, measurements, progress photos, and coach assignments.',
  keywords: ['gym management', 'fitness tracking', 'coach management', 'membership tracking'],
  authors: [{ name: 'FitTrack' }],
  creator: 'FitTrack',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'FitTrack — Gym Management Platform',
    description: 'Powerful gym management for the modern fitness professional.',
    siteName: 'FitTrack',
  },
  robots: {
    index: false, // Private app — don't index
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
