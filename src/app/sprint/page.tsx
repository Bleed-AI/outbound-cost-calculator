import { Header } from '@/components/Header'
import { SprintView } from '@/components/SprintView'
import { Suspense } from 'react'

export const metadata = {
  title: 'The Outbound Sprint | BleedAI',
  description: 'Up to 8 cold email experiments in 6 weeks. One fixed price. You keep everything.',
}

export default function SprintPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <Header variant="sprint" />
      <main>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh] text-[var(--color-text-dim)] text-sm">Loading...</div>}>
          <SprintView />
        </Suspense>
      </main>
    </div>
  )
}
