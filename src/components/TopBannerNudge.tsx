'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/pricing'
import { PRICING } from '@/lib/pricing.config'

const DISMISS_KEY = 'bleedai_nudge_dismissed'

interface TopBannerNudgeProps {
  total: number
}

/**
 * Sticky top-of-page banner that surfaces the Growth package when the user's
 * one-off campaign cost approaches package territory. Dismissible per session.
 * Plain CSS transitions — runs outside any LazyMotion context.
 */
/** Returns the package tier whose monthly price is closest-without-exceeding the user's one-off total. */
function recommendedTier(total: number): { name: 'Growth' | 'Scale'; tagline: string } {
  const { scaleMin } = PRICING.packageTiers
  if (total >= scaleMin) return { name: 'Scale', tagline: 'multi-channel campaigns + serious volume, every month' }
  return { name: 'Growth', tagline: 'ongoing experiments + full ops every month' }
}

export function TopBannerNudge({ total }: TopBannerNudgeProps) {
  const threshold = PRICING.packageNudgeThreshold
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') setDismissed(true)
    } catch {}
  }, [])

  function handleDismiss() {
    setDismissed(true)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  const visible = mounted && total >= threshold && !dismissed
  const tier = recommendedTier(total)

  // Always render the element to allow CSS height/opacity transition.
  return (
    <div
      role="alert"
      aria-hidden={!visible}
      style={{
        maxHeight: visible ? '200px' : '0px',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-[rgba(177,19,15,0.12)] border-b border-[rgba(177,19,15,0.35)] transition-all duration-300 ease-out overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3 sm:gap-4">
        <span className="relative hidden sm:flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand)] opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand)]"></span>
        </span>

        <p className="flex-1 text-[var(--color-text)] text-[12.5px] sm:text-sm leading-snug">
          <span className="font-semibold">Heads up — </span>
          <span className="text-[var(--color-text-muted)]">For around </span>
          <span className="font-semibold">{formatCurrency(total)}</span>
          <span className="text-[var(--color-text-muted)]"> on a one-off, our </span>
          <a
            href="/packages"
            className="text-[var(--color-brand)] font-semibold underline-offset-4 hover:underline"
          >
            {tier.name} package
          </a>
          <span className="text-[var(--color-text-muted)]"> gets you {tier.tagline} — likely better long-term economics.</span>
        </p>

        <a
          href="/packages"
          className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-xs font-semibold transition-colors"
        >
          See Packages
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
