import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cold Outreach Cost Calculator | BleedAI',
  description:
    'Configure your cold outreach campaign and get an instant price. BleedAI — We Install Revenue Systems that Scale B2B Firms in Weeks.',
  openGraph: {
    title: 'Cold Outreach Cost Calculator | BleedAI',
    description: 'Configure and price your campaign in minutes.',
    siteName: 'BleedAI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] bg-[var(--color-bg)] antialiased">{children}</body>
    </html>
  )
}
