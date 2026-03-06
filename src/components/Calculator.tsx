'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { parseState, serializeState } from '@/lib/url-state'
import { calculateTotal } from '@/lib/pricing'
import type { SelectionState, AddOns } from '@/lib/types'

import { SetupSection } from '@/components/sections/SetupSection'
import { CampaignVolumeSection } from '@/components/sections/CampaignVolumeSection'
import { InboxSection } from '@/components/sections/InboxSection'
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

  // Derive share URL from current state (computed, not stored in state)
  const paramStr = serializeState(state)
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin + (paramStr ? `/?${paramStr}` : '/')
      : ''

  // Sync URL whenever state changes
  useEffect(() => {
    const newUrl = paramStr ? `/?${paramStr}` : '/'
    router.replace(newUrl, { scroll: false })
  }, [paramStr, router])

  // Auto-check infraManagement when client uses their own Instantly account
  useEffect(() => {
    if (state.inboxOwnership === 'user_domains_instantly') {
      setState((prev) => ({
        ...prev,
        addOns: { ...prev.addOns, infraManagement: true },
      }))
    } else {
      setState((prev) => ({
        ...prev,
        addOns: { ...prev.addOns, infraManagement: false },
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.inboxOwnership])

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

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-28 space-y-3">
        <SetupSection value={state.setup} totalEmails={result.totalEmails} onChange={(v) => update('setup', v)} />

        <SectionDivider label="Campaign Configuration" />

        <CampaignVolumeSection
          leads={state.leadsPerMonth}
          emailsPerProspect={state.emailsPerProspect}
          totalEmails={result.totalEmails}
          onLeadsChange={(v) => update('leadsPerMonth', v)}
          onEmailsChange={(v) => update('emailsPerProspect', v)}
        />

        <InboxSection value={state.inboxOwnership} onChange={(v) => update('inboxOwnership', v)} />

        <SectionDivider label="Lead Data" />

        <DataSection value={state.dataSource} onChange={(v) => update('dataSource', v)} />
        <EnrichmentsSection value={state.enrichments} onChange={(v) => update('enrichments', v)} />

        <SectionDivider label="Campaign Strategy" />

        <CopywritingSection value={state.copywriting} onChange={(v) => update('copywriting', v)} />
        <CampaignsSection
          value={state.campaigns}
          leads={state.leadsPerMonth}
          onChange={(v) => update('campaigns', v)}
        />

        <SectionDivider label="Operations" />

        <ReplyHandlingSection
          value={state.replyHandling}
          onChange={(v) => update('replyHandling', v)}
        />
        <SupportSection
          value={state.support}
          baseTotal={result.baseTotal}
          onChange={(v) => update('support', v)}
        />

        <SectionDivider label="Optional Add-Ons" />

        <AddOnsSection
          value={state.addOns}
          totalEmails={result.totalEmails}
          baseTotal={result.baseTotal}
          onChange={updateAddOn}
        />

        <SectionDivider label="Summary" />

        <CostBreakdown
          result={result}
          coupon={state.coupon}
          onCouponChange={(v) => update('coupon', v)}
          onSubmit={() => setShowOrder(true)}
        />
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
    </>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-gray-600 text-[11px] font-medium uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}

export function Calculator() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-600 text-sm">Loading calculator...</div>
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  )
}
