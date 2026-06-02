'use client'

import { useState, useEffect, useCallback, useLayoutEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LazyMotion, domAnimation } from 'framer-motion'

import { parseState, serializeState } from '@/lib/url-state'
import { calculateTotal, DEFAULT_STATE } from '@/lib/pricing'
import type { SelectionState } from '@/lib/types'

import { CampaignVolumeSection } from '@/components/sections/CampaignVolumeSection'
import { CampaignsSection } from '@/components/sections/CampaignsSection'
import { CampaignSetupSummary } from '@/components/sections/CampaignSetupSummary'
import { AdvancedOptionsDisclosure } from '@/components/sections/AdvancedOptionsDisclosure'
import { CostBreakdown } from '@/components/CostBreakdown'
import { FloatingTotal } from '@/components/FloatingTotal'
import { OrderModal } from '@/components/OrderModal'
import { TopBannerNudge } from '@/components/TopBannerNudge'

function CalculatorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Parse URL state. We lock only the fields that have no UI — everything
  // exposed via Advanced Options honours the URL value.
  const [state, setState] = useState<SelectionState>(() => {
    const parsed = parseState(new URLSearchParams(searchParams.toString()))
    return {
      ...parsed,
      // Fields with no UI control — always forced.
      monthType: 'first_month',
      inboxOwnership: 'user_domains',
      upworkFee: false,
      addOns: DEFAULT_STATE.addOns,
    }
  })
  const [showOrder, setShowOrder] = useState(false)

  const paramStr = serializeState(state)
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin + (paramStr ? `/?${paramStr}` : '/')
      : ''

  useEffect(() => {
    const newUrl = paramStr ? `/?${paramStr}` : '/'
    router.replace(newUrl, { scroll: false })
  }, [paramStr, router])

  const update = useCallback(
    <K extends keyof SelectionState>(key: K, value: SelectionState[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    []
  )

  const result = calculateTotal(state)

  // Smooth sticky: pin to top when panel fits, anchor bottom when taller than viewport.
  const breakdownRef = useRef<HTMLDivElement>(null)
  const [stickyTop, setStickyTop] = useState(24)
  useLayoutEffect(() => {
    const el = breakdownRef.current
    if (!el) return
    const update = () => {
      const h = el.offsetHeight
      const vh = window.innerHeight
      setStickyTop(h + 48 <= vh ? 24 : vh - h - 24)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      {/* Top banner — surfaces Growth package when one-off total crosses threshold */}
      <TopBannerNudge total={result.total} />

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-28 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

        {/* ─── Left column: visible sections + advanced disclosure ─── */}
        <div className="space-y-3 min-w-0">
          <CampaignVolumeSection
            leads={state.leadsPerMonth}
            emailsPerProspect={state.emailsPerProspect}
            totalEmails={result.totalEmails}
            onLeadsChange={(v) => update('leadsPerMonth', v)}
            onEmailsChange={(v) => update('emailsPerProspect', v)}
          />

          <CampaignsSection
            value={state.campaigns}
            leads={state.leadsPerMonth}
            onChange={(v) => update('campaigns', v)}
          />

          <CampaignSetupSummary
            result={result}
            totalEmails={result.totalEmails}
          />

          <AdvancedOptionsDisclosure state={state} onUpdate={update} />

          {/* Mobile-only: CostBreakdown in flow */}
          <div className="lg:hidden mt-6">
            <CostBreakdown
              result={result}
              coupon={state.coupon}
              onSubmit={() => setShowOrder(true)}
            />
          </div>
        </div>

        {/* ─── Right column: sticky breakdown (desktop) ─── */}
        <div
          ref={breakdownRef}
          className="hidden lg:block lg:sticky transition-[top] duration-300 ease-out"
          style={{ top: `${stickyTop}px` }}
        >
          <CostBreakdown
            result={result}
            coupon={state.coupon}
            onSubmit={() => setShowOrder(true)}
          />
        </div>
      </div>

      <FloatingTotal result={result} />

      {showOrder && (
        <OrderModal
          result={result}
          shareUrl={shareUrl}
          coupon={state.coupon}
          onClose={() => setShowOrder(false)}
        />
      )}
    </LazyMotion>
  )
}

export function Calculator() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[var(--color-text-dim)] text-sm">Loading calculator...</div>
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  )
}
