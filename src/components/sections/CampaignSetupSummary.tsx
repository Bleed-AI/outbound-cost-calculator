'use client'

import { useState } from 'react'
import { SectionCard } from '@/components/SectionCard'
import { CampaignSetupIllustration } from '@/components/SectionIllustrations'
import { PRICING } from '@/lib/pricing.config'
import { formatCurrency, computeCampaignPhases } from '@/lib/pricing'
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

  // Derived setup stats.
  const inboxesNeeded = result.inboxesNeeded ?? Math.ceil(totalEmails / 500)
  const domainsNeeded = result.domainsNeeded ?? Math.ceil(totalEmails / 1500)
  const setupFee = result.brandedSetupFee ?? PRICING.brandedSetup.baseSetupFee

  const providerInboxRate = getInboxRate(inboxesNeeded)
  const providerDomainOneTime = domainsNeeded * 12
  const providerInboxMonthly = inboxesNeeded * providerInboxRate
  const providerMonth1Total = providerDomainOneTime + providerInboxMonthly

  return (
    <SectionCard
      title="What You Get"
      description="Everything we build and deliver as part of this campaign — end to end."
      illustration={<CampaignSetupIllustration />}
    >
      {/* Included scope — richer, more compelling */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3.5 mb-4">
        <div className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-wider mb-3">
          Included In Your Campaign
        </div>
        <ul className="space-y-2 text-[12.5px] text-[var(--color-text-muted)] leading-relaxed">
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">Branded sending infrastructure</strong> — {inboxesNeeded} inboxes across {domainsNeeded} domains built under your domain, with 14-day provider warmup ({formatCurrency(setupFee)} setup included)</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">Full DFY lead discovery</strong> — we scrape from LinkedIn Sales Nav, Apollo, Google Maps, and niche directories matched to your ICP</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">4-provider email-finding waterfall</strong> — TryKit + LeadMagic + FindyMail + internal finder, with catch-all verification on every contact</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">Decision-maker identification</strong> — we find the right person in each company, not just any email</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">AI personalization on every lead</strong> — website research + custom personalization line written per prospect</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">Full copy strategy</strong> — angles, hooks, subject lines, sequenced follow-ups, A/B variants, spam-blacklist filtered</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">AI reply agent</strong> — automated replies to common objections, with hot leads forwarded to you (or human-in-the-loop mode)</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">Campaign launch on Instantly</strong> — AI inbox placement + sending optimization, monitored daily</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-[var(--color-brand)] flex-shrink-0 mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text)]">Email support</strong> throughout the campaign — we&apos;re responsive when you need us</span>
          </li>
        </ul>
      </div>

      {/* Compact stat rows — replaces the previous big cards */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3 mb-4 space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[var(--color-text-dim)] text-xs">Sends This Campaign</span>
          <span className="text-[var(--color-text)] font-semibold text-base font-[family-name:var(--font-mono)] tabular-nums">
            {totalEmails.toLocaleString()}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[var(--color-text-dim)] text-xs">Monthly Email Capacity Built</span>
          <span className="text-[var(--color-text-muted)] font-medium text-sm font-[family-name:var(--font-mono)] tabular-nums">
            {totalEmails.toLocaleString()}<span className="text-[var(--color-text-ghost)]"> / mo</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-1 border-t border-[var(--color-border)] mt-2">
          <span className="text-[var(--color-text-dim)] text-xs">Inbox Infrastructure</span>
          <span className="text-[var(--color-text-muted)] text-xs font-[family-name:var(--font-mono)] tabular-nums">
            {inboxesNeeded} inbox{inboxesNeeded !== 1 ? 'es' : ''} · {domainsNeeded} domain{domainsNeeded !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Timeline — 4 phases, exact day counts */}
      <CampaignTimeline totalEmails={totalEmails} />


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
                <span className="text-[var(--color-text-ghost)] font-normal"> — paid directly to provider, not BleedAI</span>
              </div>
              <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5 tabular-nums">
                ≈{fmtUSD(providerDomainOneTime)} one-time + ≈{fmtUSD(providerInboxMonthly)}/mo
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

        {/* Provider cost detail (collapsed by default) */}
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

/* ── 4-phase campaign timeline ───────────────────────────── */

function CampaignTimeline({ totalEmails }: { totalEmails: number }) {
  const phases = computeCampaignPhases(totalEmails)

  return (
    <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-3 text-[11px] space-y-1.5 mb-4">
      <div className="text-[var(--color-text-dim)] text-[9px] uppercase tracking-wider mb-2 font-medium">
        Campaign Timeline · {phases.totalDays} days total
      </div>

      <div className="flex gap-2 items-baseline">
        <span className="text-[var(--color-text-ghost)] w-24 flex-shrink-0 font-medium">Day 1</span>
        <span className="text-[var(--color-text-dim)]">Infrastructure setup &amp; kickoff — domains registered, inboxes provisioned</span>
      </div>

      <div className="flex gap-2 items-baseline">
        <span className="text-[var(--color-text-ghost)] w-24 flex-shrink-0 font-medium">Days 2 – 15</span>
        <span className="text-[var(--color-text-dim)]">Provider warmup — zero sends, building inbox reputation</span>
      </div>

      <div className="flex gap-2 items-baseline">
        <span className="text-[var(--color-brand)] w-24 flex-shrink-0 font-medium">Days {phases.rampStart} – {phases.rampEnd}</span>
        <span className="text-[var(--color-text-muted)]">
          Outbound ramp — <strong className="text-[var(--color-text)]">{phases.rampEmails.toLocaleString()} emails</strong> delivered as throughput climbs
        </span>
      </div>

      {phases.steadyEmails > 0 && (
        <div className="flex gap-2 items-baseline">
          <span className="text-[var(--color-brand)] w-24 flex-shrink-0 font-medium">Days {phases.steadyStart} – {phases.steadyEnd}</span>
          <span className="text-[var(--color-text-muted)]">
            Steady-state sends — <strong className="text-[var(--color-text)]">{phases.steadyEmails.toLocaleString()} remaining emails</strong> delivered at peak rate
          </span>
        </div>
      )}

      <div className="pt-2 mt-2 border-t border-[var(--color-border)] text-[var(--color-text-ghost)] text-[10px] leading-relaxed">
        Throughput math: {phases.inboxes} inbox{phases.inboxes !== 1 ? 'es' : ''} ramp from {PRICING.warmup.startPerDay}/day per inbox, +{PRICING.warmup.dailyIncrement}/day each day, until peak ~{PRICING.warmup.startPerDay + (PRICING.warmup.rampDays - 1) * PRICING.warmup.dailyIncrement}/day per inbox is reached.
      </div>
    </div>
  )
}
