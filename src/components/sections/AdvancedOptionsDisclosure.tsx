'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring } from '@/lib/motion'
import { DataSection } from '@/components/sections/DataSection'
import { EnrichmentsSection } from '@/components/sections/EnrichmentsSection'
import { CopywritingSection } from '@/components/sections/CopywritingSection'
import { ReplyHandlingSection } from '@/components/sections/ReplyHandlingSection'
import { SupportSection } from '@/components/sections/SupportSection'
import { AddOnsSection } from '@/components/sections/AddOnsSection'
import type { SelectionState, AddOns, PricingResult } from '@/lib/types'

interface AdvancedOptionsDisclosureProps {
  state: SelectionState
  result: PricingResult
  onUpdate: <K extends keyof SelectionState>(key: K, value: SelectionState[K]) => void
  onAddOnChange: (key: keyof AddOns, value: boolean) => void
}

/**
 * Single collapsible panel that exposes the "locked default" fields for users
 * who want to override them. Closed by default — most buyers should never
 * need to touch this.
 */
export function AdvancedOptionsDisclosure({ state, result, onUpdate, onAddOnChange }: AdvancedOptionsDisclosureProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-surface-0)]/40 px-4 py-3 text-left hover:border-[var(--color-border-active)] hover:bg-[var(--color-surface-0)] transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
            open
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] text-[var(--color-brand)]'
              : 'border-[var(--color-border-hover)] text-[var(--color-text-ghost)] group-hover:text-[var(--color-text-muted)]'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <div className="text-[var(--color-text)] font-medium text-sm">Advanced Options &amp; Add-Ons</div>
            <div className="text-[var(--color-text-dim)] text-[11px]">
              Override defaults — data source, enrichments, copy, reply, support — plus optional add-ons (LinkedIn, CRM, drip, landing page, more)
            </div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-ghost)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <DataSection value={state.dataSource} onChange={(v) => onUpdate('dataSource', v)} />
              <EnrichmentsSection value={state.enrichments} onChange={(v) => onUpdate('enrichments', v)} />
              <CopywritingSection value={state.copywriting} onChange={(v) => onUpdate('copywriting', v)} />
              <ReplyHandlingSection value={state.replyHandling} onChange={(v) => onUpdate('replyHandling', v)} />
              <SupportSection value={state.support} onChange={(v) => onUpdate('support', v)} />
              <AddOnsSection
                value={state.addOns}
                totalEmails={result.totalEmails}
                baseTotal={result.baseTotal}
                onChange={onAddOnChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
