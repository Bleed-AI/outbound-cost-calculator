import { Header } from '@/components/Header'
import { TrialsView } from '@/components/TrialsView'
import { Suspense } from 'react'

export const metadata = {
  title: 'BleedAI — Trial Campaigns',
  description: 'Parallel campaign experiments against different market segments — discover where your offer hits, walk away with leads.',
}

export default function TrialsPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <Header variant="trials" />
      <main>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh] text-[var(--color-text-dim)] text-sm">Loading...</div>}>
          <TrialsView />
        </Suspense>
      </main>
    </div>
  )
}
