'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Calculator } from '@/components/Calculator'
import { ResultsGallery } from '@/components/ResultsGallery'
import { TopBannerNudge } from '@/components/TopBannerNudge'

/**
 * Client shell for the homepage. Owns the lifted `total` so the top banner
 * can sit ABOVE the Header (banners belong at the very top of the page) —
 * the banner subscribes to `total` and the Calculator pushes updates up.
 */
export function HomeShell() {
  const [total, setTotal] = useState(0)

  return (
    <>
      <TopBannerNudge total={total} />
      <Header variant="calculator" />
      <main>
        <Calculator onTotalChange={setTotal} />
      </main>
      <ResultsGallery />
    </>
  )
}
