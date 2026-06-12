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

/** Compact "k" formatter for the capacity side-note. */
function fmtK(n: number): string {
  const rounded = Math.round(n / 100) * 100
  return rounded >= 1000
    ? `${(rounded / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`
    : rounded.toLocaleString()
}

/* Each "what you get" item gets its own icon so the list reads as a rich,
   premium deliverable set rather than a row of identical checkmarks. */
type IncludedItem = { icon: keyof typeof ICON_PATHS; title: string; body: string }

const ICON_PATHS = {
  infra: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  discovery: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  waterfall: 'M3 4h18M5 4v6a7 7 0 007 7 7 7 0 007-7V4M12 17v4M8 21h8',
  person: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  ai: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  copy: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  reply: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM7 20l-2 1 1-3',
  rocket: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-1.96-2.58a14.926 14.926 0 01-2.58-5.84m2.58 5.84a6 6 0 01-7.38-5.84h4.8m2.58.7a14.98 14.98 0 01-2.58 1.88',
  slack: 'M7 8h10M7 12h6m-6 8l-3-3h-1a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H10l-3 3z',
} as const

export function CampaignSetupSummary({ result, totalEmails }: CampaignSetupSummaryProps) {
  const [infraOpen, setInfraOpen] = useState(false)

  // Derived setup stats from the no-ramp capacity model.
  const inboxesNeeded = result.inboxesNeeded ?? Math.ceil(totalEmails / 540)
  const domainsNeeded = result.domainsNeeded ?? Math.ceil(inboxesNeeded / 3)
  const setupFee = result.brandedSetupFee ?? PRICING.brandedSetup.baseSetupFee
  const backupDomains = result.backupDomains ?? 0

  const INCLUDED: IncludedItem[] = [
    {
      icon: 'infra',
      title: 'Branded sending infrastructure',
      body: `${inboxesNeeded} inboxes across ${domainsNeeded} domains built under your brand, with a 2-week provider warmup (${formatCurrency(setupFee)} setup included)`,
    },
    {
      icon: 'discovery',
      title: 'Full DFY lead discovery',
      body: 'we source from LinkedIn Sales Nav, Google Maps, Apollo, Apify actors and niche directories matched to your ICP',
    },
    {
      icon: 'waterfall',
      title: 'Multi-provider email-finding waterfall',
      body: 'Clay + TryKit + Prospeo + LeadMagic + FindyMail, with catch-all verification on every contact',
    },
    {
      icon: 'person',
      title: 'Decision-maker identification',
      body: 'we find the right person in each company, not just any email',
    },
    {
      icon: 'ai',
      title: 'AI personalization on every lead',
      body: 'website research + a custom personalization line written per prospect',
    },
    {
      icon: 'copy',
      title: 'Full copy strategy',
      body: 'angles, hooks, subject lines, sequenced follow-ups, A/B variants, spam-blacklist filtered',
    },
    {
      icon: 'reply',
      title: 'AI reply agent',
      body: 'automated replies to common objections, with hot leads forwarded to you (or human-in-the-loop)',
    },
    {
      icon: 'rocket',
      title: 'Campaign launch on Instantly',
      body: 'AI inbox placement + sending optimization, monitored daily',
    },
    {
      icon: 'slack',
      title: 'Dedicated Slack support',
      body: 'a private channel with same-day responses throughout the campaign',
    },
  ]

  return (
    <SectionCard
      title="What You Get"
      description="Everything we build and deliver as part of this campaign — end to end."
      illustration={<CampaignSetupIllustration />}
    >
      {/* Included scope — icon per item, richer and more compelling */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-4 mb-4">
        <div className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-wider mb-3.5">
          Included In Your Campaign
        </div>
        <ul className="space-y-3 text-[13.5px] text-[var(--color-text-muted)] leading-relaxed">
          {INCLUDED.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-[7px] bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.25)] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS[item.icon]} />
                </svg>
              </span>
              <span>
                <strong className="text-[var(--color-text)] font-semibold">{item.title}</strong>
                {' — '}{item.body}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Headline stat: total sends this campaign (prominent); capacity is a side-note */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3.5 mb-4 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider">Total Sends This Campaign</span>
          <span className="text-[var(--color-text)] font-bold text-xl font-[family-name:var(--font-mono)] tabular-nums">
            {totalEmails.toLocaleString()}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-2 border-t border-[var(--color-border)]">
          <span className="text-[var(--color-text-ghost)] text-[11px]">System capacity built (side info)</span>
          <span className="text-[var(--color-text-dim)] text-[11px] font-[family-name:var(--font-mono)] tabular-nums">
            ≈{fmtK(result.monthlyCapacity)}<span className="text-[var(--color-text-ghost)]"> / mo</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[var(--color-text-ghost)] text-[11px]">Infrastructure</span>
          <span className="text-[var(--color-text-dim)] text-[11px] font-[family-name:var(--font-mono)] tabular-nums">
            {inboxesNeeded} inbox{inboxesNeeded !== 1 ? 'es' : ''} · {domainsNeeded} domain{domainsNeeded !== 1 ? 's' : ''}
            {backupDomains > 0 && <span className="text-[var(--color-text-ghost)]"> (incl. {backupDomains} backup)</span>}
          </span>
        </div>
      </div>

      {/* Timeline — 6 weeks, no ramp */}
      <CampaignTimeline totalEmails={totalEmails} />

      {/* Infrastructure included — yours to keep */}
      {result.infraIncludedCost > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setInfraOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 rounded-[var(--radius-inner)] border border-[rgba(52,211,153,0.2)] bg-[var(--color-success-bg)] px-3 py-2.5 text-left hover:border-[rgba(52,211,153,0.35)] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 flex-shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <div className="min-w-0">
                <div className="text-[var(--color-text)] text-[11px] font-semibold">
                  Branded domains &amp; inboxes — included, yours to keep
                </div>
                <div className="text-[var(--color-text-dim)] text-[10px] mt-0.5">
                  {domainsNeeded} domains (1 yr) + {inboxesNeeded} inboxes ({result.monthsIncluded} mo) · already in your total
                </div>
              </div>
            </div>
            <svg
              className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-ghost)] transition-transform ${infraOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {infraOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
                <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Domains</div>
                <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{domainsNeeded}</div>
                <div className="text-[var(--color-text-dim)] text-[11px]">{formatCurrency(PRICING.infraIncluded.domainCostPerYear)} / domain · 1-yr registration</div>
                <div className="pt-1.5 border-t border-[var(--color-border)] flex items-baseline gap-1">
                  <span className="text-[var(--color-text)] font-semibold text-sm">{formatCurrency(result.infraDomainCost)}</span>
                  <span className="text-[var(--color-text-dim)] text-xs">included</span>
                </div>
              </div>
              <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
                <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Inboxes</div>
                <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{inboxesNeeded}</div>
                <div className="text-[var(--color-text-dim)] text-[11px]">
                  {formatCurrency(result.inboxMonthlyRate)} / inbox / mo × {result.monthsIncluded} mo
                </div>
                <div className="pt-1.5 border-t border-[var(--color-border)] flex items-baseline gap-1">
                  <span className="text-[var(--color-text)] font-semibold text-sm">{formatCurrency(result.infraInboxCost)}</span>
                  <span className="text-[var(--color-text-dim)] text-xs">included</span>
                </div>
              </div>
              <div className="col-span-2 text-[var(--color-text-ghost)] text-[10px] text-center leading-relaxed">
                <strong className="text-[var(--color-text-muted)]">{formatCurrency(result.infraIncludedCost)}</strong> of infrastructure — folded into your campaign total, not charged on top, and discounts don&apos;t reduce it. The domains and inboxes are <strong className="text-[var(--color-text-muted)]">yours</strong> after the campaign.
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}

/* ── 2-phase campaign timeline (6 weeks, no ramp) ─────────── */

function CampaignTimeline({ totalEmails }: { totalEmails: number }) {
  const phases = computeCampaignPhases(totalEmails)
  const weeks = Math.round(phases.totalDays / 7)

  return (
    <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-3 text-[11px] space-y-1.5 mb-4">
      <div className="text-[var(--color-text-dim)] text-[9px] uppercase tracking-wider mb-2 font-medium">
        Campaign Timeline · {weeks} weeks total
      </div>

      <div className="flex gap-2 items-baseline">
        <span className="text-[var(--color-text-ghost)] w-28 flex-shrink-0 font-medium">Weeks 1 – 2</span>
        <span className="text-[var(--color-text-dim)]">Inbox warmup — zero sends, building sender reputation across all {phases.inboxes} inboxes</span>
      </div>

      <div className="flex gap-2 items-baseline">
        <span className="text-[var(--color-brand)] w-28 flex-shrink-0 font-medium">Weeks 3 – 6</span>
        <span className="text-[var(--color-text-muted)]">
          Full-capacity sending — <strong className="text-[var(--color-text)]">all {totalEmails.toLocaleString()} emails</strong> delivered at full volume from day one of sending
        </span>
      </div>

      <div className="pt-2 mt-2 border-t border-[var(--color-border)] text-[var(--color-text-ghost)] text-[10px] leading-relaxed">
        Throughput: {phases.sendingInboxes} sending inbox{phases.sendingInboxes !== 1 ? 'es' : ''} × {PRICING.capacity.emailsPerInboxPerDay} emails/day on weekdays ≈ {phases.dailyVolume.toLocaleString()} emails/day, across 4 weeks of sending. No ramp — full capacity once warmup completes.
      </div>
    </div>
  )
}
