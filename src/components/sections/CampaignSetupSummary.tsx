'use client'

import { useState } from 'react'
import { SectionCard } from '@/components/SectionCard'
import { CampaignSetupIllustration } from '@/components/SectionIllustrations'
import { PRICING } from '@/lib/pricing.config'
import { formatCurrency } from '@/lib/pricing'
import type { PricingResult } from '@/lib/types'

interface CampaignSetupSummaryProps {
  result: PricingResult
  totalEmails: number
}

function getInboxRate(inboxCount: number): number {
  if (inboxCount >= 100) return 3.00
  if (inboxCount >= 30) return 3.25
  return 3.50
}

function fmtUSD(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString()}` : `$${n.toFixed(2)}`
}

export function CampaignSetupSummary({ result, totalEmails }: CampaignSetupSummaryProps) {
  const [providerOpen, setProviderOpen] = useState(false)

  // Derived setup stats — always in first-month branded mode for simplified calc.
  const inboxesNeeded = result.inboxesNeeded ?? Math.ceil(totalEmails / 500)
  const domainsNeeded = result.domainsNeeded ?? Math.ceil(totalEmails / 1500)
  const month1ActualEmails = result.month1ActualEmails ?? inboxesNeeded * 210
  const setupFee = result.brandedSetupFee ?? PRICING.brandedSetup.baseSetupFee

  const providerInboxRate = getInboxRate(inboxesNeeded)
  const providerDomainOneTime = domainsNeeded * 12
  const providerInboxMonthly = inboxesNeeded * providerInboxRate
  const providerMonth1Total = providerDomainOneTime + providerInboxMonthly

  return (
    <SectionCard
      title="What You Get"
      description="Here's what we deliver as part of this campaign — and the setup timeline."
      illustration={<CampaignSetupIllustration />}
    >
      {/* Included scope — locked defaults summary */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3 mb-4">
        <div className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-wider mb-2.5">
          Included In Your Campaign
        </div>
        <ul className="space-y-1.5 text-[12px] text-[var(--color-text-muted)]">
          <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">✓</span><span><strong className="text-[var(--color-text)]">Branded domains &amp; inboxes</strong> set up under your domain — {inboxesNeeded} inbox{inboxesNeeded !== 1 ? 'es' : ''} across {domainsNeeded} domain{domainsNeeded !== 1 ? 's' : ''} ({formatCurrency(setupFee)} setup)</span></li>
          <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">✓</span><span><strong className="text-[var(--color-text)]">Full DFY lead sourcing</strong> — BleedAI scrapes &amp; validates from LinkedIn, Apollo, directories</span></li>
          <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">✓</span><span><strong className="text-[var(--color-text)]">Standard enrichments</strong> — website + AI personalisation</span></li>
          <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">✓</span><span><strong className="text-[var(--color-text)]">Full strategy copywriting</strong> — angles, sequences, A/B variants</span></li>
          <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">✓</span><span><strong className="text-[var(--color-text)]">AI reply agent</strong> — automated or human-in-the-loop modes</span></li>
          <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">✓</span><span><strong className="text-[var(--color-text)]">Email support</strong> throughout the campaign</span></li>
        </ul>
      </div>

      {/* Capacity vs actual sends */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 text-center">
          <div className="text-[var(--color-text-ghost)] text-[10px] uppercase tracking-wider mb-1">Sends This Campaign</div>
          <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{month1ActualEmails.toLocaleString()}</div>
          <div className="text-[var(--color-text-dim)] text-[10px] mt-0.5">14-day ramp on warmed inboxes</div>
        </div>
        <div className="rounded-[var(--radius-inner)] border border-[rgba(177,19,15,0.25)] bg-[var(--color-brand-muted)] p-3 text-center">
          <div className="text-[var(--color-brand)] text-[10px] uppercase tracking-wider mb-1">Capacity Built</div>
          <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{totalEmails.toLocaleString()}</div>
          <div className="text-[var(--color-text-dim)] text-[10px] mt-0.5">infra ready for ongoing scale</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2.5 text-[11px] space-y-1 mb-4">
        <div className="text-[var(--color-text-dim)] text-[9px] uppercase tracking-wider mb-1.5 font-medium">Campaign Timeline</div>
        <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-20 flex-shrink-0">Day 1</span><span className="text-[var(--color-text-dim)]">Infrastructure setup</span></div>
        <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-20 flex-shrink-0">Days 2–15</span><span className="text-[var(--color-text-dim)]">Provider warmup — no sends</span></div>
        <div className="flex gap-2"><span className="text-[var(--color-brand)] w-20 flex-shrink-0">Days 16–29</span><span className="text-[var(--color-text-muted)]">Outbound ramp — <strong className="text-[var(--color-text)]">{month1ActualEmails.toLocaleString()} sends</strong></span></div>
      </div>

      {/* Provider cost disclosure — transparency */}
      <div>
        <button
          type="button"
          onClick={() => setProviderOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2.5 text-left hover:border-[var(--color-border-hover)] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand)] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand)]"></span>
            </span>
            <div className="min-w-0">
              <div className="text-[var(--color-text-muted)] text-[11px] font-medium">
                Inbox provider costs
                <span className="text-[var(--color-text-ghost)] font-normal"> — not on BleedAI&apos;s invoice</span>
              </div>
              <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5 tabular-nums">
                ≈{fmtUSD(providerDomainOneTime)} one-time + ≈{fmtUSD(providerInboxMonthly)}/mo → your inbox provider
              </div>
            </div>
          </div>
          <svg
            className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-ghost)] transition-transform ${providerOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {providerOpen && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
              <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Domains</div>
              <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{domainsNeeded}</div>
              <div className="text-[var(--color-text-dim)] text-[11px]">$12 / domain · one-time</div>
              <div className="pt-1.5 border-t border-[var(--color-border)] flex items-baseline gap-1">
                <span className="text-[var(--color-text)] font-semibold text-sm">{fmtUSD(providerDomainOneTime)}</span>
                <span className="text-[var(--color-text-dim)] text-xs">one-time</span>
              </div>
            </div>
            <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
              <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Inboxes</div>
              <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{inboxesNeeded}</div>
              <div className="text-[var(--color-text-dim)] text-[11px]">
                {fmtUSD(providerInboxRate)} / inbox / month
                {inboxesNeeded >= 30 && <span className="ml-1 text-[var(--color-success)]">(vol. rate)</span>}
              </div>
              <div className="pt-1.5 border-t border-[var(--color-border)] flex items-baseline gap-1">
                <span className="text-[var(--color-text)] font-semibold text-sm">{fmtUSD(providerInboxMonthly)}</span>
                <span className="text-[var(--color-text-dim)] text-xs">/ month</span>
              </div>
            </div>
            <div className="col-span-2 text-[var(--color-text-ghost)] text-[10px] text-center">
              First-month provider spend: <strong className="text-[var(--color-text-muted)]">{fmtUSD(providerMonth1Total)}</strong> — billed directly by your inbox provider.
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
