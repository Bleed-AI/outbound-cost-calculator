import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cold Outreach Campaign Builder | BleedAI',
  description:
    'Configure your cold outreach campaign and get an instant price. BleedAI — We Install Revenue Systems that Scale B2B Firms in Weeks.',
  openGraph: {
    title: 'Cold Outreach Campaign Builder | BleedAI',
    description: 'Configure and price your campaign in minutes.',
    siteName: 'BleedAI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#050508] antialiased">{children}</body>
    </html>
  )
}
