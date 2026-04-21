'use client'

import { useState, useEffect, useCallback, useLayoutEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LazyMotion, domAnimation } from 'framer-motion'

import { parseState, serializeState } from '@/lib/url-state'
import { calculateTotal } from '@/lib/pricing'
import type { SelectionState, AddOns } from '@/lib/types'

import { MonthTypeSection } from '@/components/sections/MonthTypeSection'
import { CampaignVolumeSection } from '@/components/sections/CampaignVolumeSection'
import { DataSection } from '@/components/sections/DataSection'
import { EnrichmentsSection } from '@/components/sections/EnrichmentsSection'
import { CopywritingSection } from '@/components/sections/CopywritingSection'
import { CampaignsSection } from '@/components/sections/CampaignsSection'
import { ReplyHandlingSection } from '@/components/sections/ReplyHandlingSection'
import { SupportSection } from '@/components/sections/SupportSection'
import { AddOnsSection } from '@/components/sections/AddOnsSection'
import { CostBreakdown } from '@/components/CostBreakdown'
import { FloatingTotal } from '@/components/FloatingTotal'
import { OrderModal } from '@/components/OrderModal'

function CalculatorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [state, setState] = useState<SelectionState>(() =>
    parseState(new URLSearchParams(searchParams.toString()))
  )
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

  // For the Pilot Month + Branded scenario, also compute what the same
  // configuration would cost as a Normal Month — so the "Month 2 onwards"
  // card shows the exact recurring price the client will be billed from month 2.
  const month2Result = result.isFirstMonthBranded
    ? calculateTotal({ ...state, monthType: 'normal_month' })
    : null

  // Smooth sticky: always sticky, but dynamic `top` keeps the panel visible.
  // When panel fits in viewport → pin to top (24px gap).
  // When panel is taller than viewport → anchor so its bottom sits 24px above viewport bottom
  // (so Campaign Total + Submit button are always visible as user scrolls).
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
      {/* Editorial split: sections left, breakdown sticky right */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-28 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

        {/* ─── Left column: all sections ─── */}
        <div className="space-y-3 min-w-0">
          <MonthTypeSection
            monthType={state.monthType}
            inboxOwnership={state.inboxOwnership}
            leads={state.leadsPerMonth}
            emailsPerProspect={state.emailsPerProspect}
            totalEmails={result.totalEmails}
            pricingResult={result}
            month2Result={month2Result}
            onMonthTypeChange={(v) => update('monthType', v)}
            onInboxChange={(v) => update('inboxOwnership', v)}
            onLeadsChange={(v) => update('leadsPerMonth', v)}
            onEmailsChange={(v) => update('emailsPerProspect', v)}
          />

          {!result.isFirstMonthBranded && (
            <>
              <GroupLabel label="Campaign Volume" />
              <CampaignVolumeSection
                leads={state.leadsPerMonth}
                emailsPerProspect={state.emailsPerProspect}
                totalEmails={result.totalEmails}
                onLeadsChange={(v) => update('leadsPerMonth', v)}
                onEmailsChange={(v) => update('emailsPerProspect', v)}
              />
            </>
          )}

          <GroupLabel label="Lead Data" />
          <DataSection value={state.dataSource} onChange={(v) => update('dataSource', v)} />
          <EnrichmentsSection value={state.enrichments} onChange={(v) => update('enrichments', v)} />

          <GroupLabel label="Campaign Strategy" />
          <CopywritingSection value={state.copywriting} onChange={(v) => update('copywriting', v)} />
          <CampaignsSection
            value={state.campaigns}
            leads={state.leadsPerMonth}
            onChange={(v) => update('campaigns', v)}
          />

          <GroupLabel label="Operations" />
          <ReplyHandlingSection
            value={state.replyHandling}
            onChange={(v) => update('replyHandling', v)}
          />
          <SupportSection
            value={state.support}
            baseTotal={result.baseTotal}
            onChange={(v) => update('support', v)}
          />

          <GroupLabel label="Optional Add-Ons" />
          <AddOnsSection
            value={state.addOns}
            totalEmails={result.totalEmails}
            baseTotal={result.baseTotal}
            onChange={updateAddOn}
          />

          {/* Mobile-only: CostBreakdown in flow */}
          <div className="lg:hidden mt-6">
            <GroupLabel label="Summary" />
            <CostBreakdown
              result={result}
              coupon={state.coupon}
              onCouponChange={(v) => update('coupon', v)}
              upworkFee={state.upworkFee}
              onUpworkFeeChange={(v) => update('upworkFee', v)}
              onSubmit={() => setShowOrder(true)}
            />
          </div>
        </div>

        {/* ─── Right column: sticky breakdown (desktop only) ─── */}
        <div
          ref={breakdownRef}
          className="hidden lg:block lg:sticky transition-[top] duration-300 ease-out"
          style={{ top: `${stickyTop}px` }}
        >
          <CostBreakdown
            result={result}
            coupon={state.coupon}
            onCouponChange={(v) => update('coupon', v)}
            upworkFee={state.upworkFee}
            onUpworkFeeChange={(v) => update('upworkFee', v)}
            onSubmit={() => setShowOrder(true)}
          />
        </div>
      </div>

      {/* Floating total — mobile only (desktop has sticky breakdown) */}
      <FloatingTotal result={result} />

      {showOrder && (
        <OrderModal
          result={result}
          month2Result={month2Result}
          shareUrl={shareUrl}
          coupon={state.coupon}
          onClose={() => setShowOrder(false)}
        />
      )}
    </LazyMotion>
  )
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 pt-4 pb-0.5 px-1">
      <span className="w-1 h-1 rounded-full bg-[var(--color-brand)]" />
      <span className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
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
