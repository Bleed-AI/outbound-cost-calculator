'use client'

import { useState, useEffect, useCallback, useLayoutEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LazyMotion, domAnimation } from 'framer-motion'

import { parseState, serializeState } from '@/lib/url-state'
import { calculateTotal } from '@/lib/pricing'
import type { SelectionState, AddOns } from '@/lib/types'

import { CampaignVolumeSection } from '@/components/sections/CampaignVolumeSection'
import { CampaignsSection } from '@/components/sections/CampaignsSection'
import { CampaignSetupSummary } from '@/components/sections/CampaignSetupSummary'
import { AdvancedOptionsDisclosure } from '@/components/sections/AdvancedOptionsDisclosure'
import { CostBreakdown } from '@/components/CostBreakdown'
import { FloatingTotal } from '@/components/FloatingTotal'
import { OrderModal } from '@/components/OrderModal'

interface CalculatorContentProps {
  onTotalChange?: (total: number) => void
}

function CalculatorContent({ onTotalChange }: CalculatorContentProps) {
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
      // Add-ons honour URL state (toggleable via Advanced Options).
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

  const updateAddOn = useCallback(
    (key: keyof AddOns, value: boolean) =>
      setState((prev) => ({ ...prev, addOns: { ...prev.addOns, [key]: value } })),
    []
  )

  const result = calculateTotal(state)

  // Push total upward so the parent shell can position the banner above Header.
  useEffect(() => {
    onTotalChange?.(result.total)
  }, [result.total, onTotalChange])

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

          <AdvancedOptionsDisclosure
            state={state}
            result={result}
            onUpdate={update}
            onAddOnChange={updateAddOn}
          />

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

interface CalculatorProps {
  onTotalChange?: (total: number) => void
}

export function Calculator({ onTotalChange }: CalculatorProps = {}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[var(--color-text-dim)] text-sm">Loading calculator...</div>
        </div>
      }
    >
      <CalculatorContent onTotalChange={onTotalChange} />
    </Suspense>
  )
}
