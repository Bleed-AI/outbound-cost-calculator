import { Header } from '@/components/Header'
import { PackagesView } from '@/components/PackagesView'

export const metadata = {
  title: 'BleedAI — Managed Outbound Packages',
  description: 'Pilot, Growth, and Scale — end-to-end monthly outbound packages run by BleedAI.',
}

export default function PackagesPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <Header variant="packages" />
      <main>
        <PackagesView />
      </main>
    </div>
  )
}
