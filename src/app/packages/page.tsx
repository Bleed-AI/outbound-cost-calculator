import { Header } from '@/components/Header'
import { PackagesView } from '@/components/PackagesView'

export const metadata = {
  title: 'BleedAI — Premium Packages',
  description: 'Pilot, Growth, and Scale packages for ongoing outbound campaigns.',
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
