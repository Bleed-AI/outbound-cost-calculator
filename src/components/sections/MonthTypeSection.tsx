'use client'

import { useState, useEffect } from 'react'
import { SectionCard } from '@/components/SectionCard'
import { CampaignSetupIllustration } from '@/components/SectionIllustrations'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import { EPP_OPTIONS } from '@/lib/pricing'
import { formatCurrency } from '@/lib/pricing'
import type { MonthType, InboxOwnership, PricingResult, LeadsPerMonth, EmailsPerProspect } from '@/lib/types'

// ── Capacity math for Scenario 3 ─────────────────────────────────────────────

function computeBrandedStats(totalCapacityEmails: number) {
  const inboxesNeeded = Math.ceil(totalCapacityEmails / 500)
  const domainsNeeded = Math.ceil(totalCapacityEmails / 1500)
  const { rampDays, startPerDay, dailyIncrement } = PRICING.warmup
  const rampPerInbox = (rampDays / 2) * (2 * startPerDay + (rampDays - 1) * dailyIncrement)
  const month1ActualEmails = inboxesNeeded * rampPerInbox
  const setupFee = PRICING.brandedSetup.baseSetupFee +
    Math.max(0, inboxesNeeded - PRICING.brandedSetup.extraInboxThreshold) * PRICING.brandedSetup.extraPerInbox
  return { inboxesNeeded, domainsNeeded, month1ActualEmails, setupFee }
}

// ── Provider infra cost display (driven by capacity, no own slider) ───────────

function getInboxRate(inboxCount: number): number {
  if (inboxCount >= 100) return 3.00
  if (inboxCount >= 30) return 3.25
  return 3.50
}

function fmtUSD(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString()}` : `$${n.toFixed(2)}`
}

function InfraEstimator({ emailsPerMonth }: { emailsPerMonth: number }) {
  const [tiersOpen, setTiersOpen] = useState(false)
  const inboxes = Math.ceil(emailsPerMonth / 500)
  const domains = Math.ceil(emailsPerMonth / 1500)
  const inboxRate = getInboxRate(inboxes)
  const domainCost = domains * 12
  const monthlyInboxCost = inboxes * inboxRate

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
          <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Domains</div>
          <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{domains}</div>
          <div className="text-[var(--color-text-dim)] text-[11px]">$12 / domain · one-time</div>
          <div className="pt-1.5 border-t border-[var(--color-border)] flex items-baseline gap-1">
            <span className="text-[var(--color-text)] font-semibold text-sm">{fmtUSD(domainCost)}</span>
            <span className="text-[var(--color-text-dim)] text-xs">one-time</span>
          </div>
        </div>
        <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
          <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Inboxes</div>
          <div className="text-[var(--color-text)] text-2xl font-bold tabular-nums">{inboxes}</div>
          <div className="text-[var(--color-text-dim)] text-[11px]">
            {fmtUSD(inboxRate)} / inbox / month
            {inboxes >= 30 && <span className="ml-1 text-[var(--color-success)]">(vol. rate)</span>}
          </div>
          <div className="pt-1.5 border-t border-[var(--color-border)] flex items-baseline gap-1">
            <span className="text-[var(--color-text)] font-semibold text-sm">{fmtUSD(monthlyInboxCost)}</span>
            <span className="text-[var(--color-text-dim)] text-xs">/ month</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setTiersOpen((v) => !v)}
        className="flex items-center gap-1 text-[var(--color-text-ghost)] text-[11px] hover:text-[var(--color-text-muted)] transition-colors"
      >
        <span>Inbox pricing tiers</span>
        <svg
          className={`w-3 h-3 transition-transform ${tiersOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {tiersOpen && (
        <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 text-[11px] text-[var(--color-text-dim)] space-y-0.5">
          <div className={inboxes < 30 ? 'text-[var(--color-text-muted)]' : ''}>1–29 inboxes: $3.50 / inbox / month</div>
          <div className={inboxes >= 30 && inboxes < 100 ? 'text-[var(--color-text-muted)]' : ''}>30–99 inboxes: $3.25 / inbox / month</div>
          <div className={inboxes >= 100 ? 'text-[var(--color-text-muted)]' : ''}>100+ inboxes: $3.00 / inbox / month</div>
        </div>
      )}
    </div>
  )
}

// ── Collapsible provider cost disclosure ─────────────────────────────────────

function ProviderCostDisclosure({
  emailsPerMonth,
  inboxes,
  domains,
}: {
  emailsPerMonth: number
  inboxes: number
  domains: number
}) {
  const [open, setOpen] = useState(false)
  const inboxRate = getInboxRate(inboxes)
  const domainCost = domains * 12
  const monthlyInboxCost = inboxes * inboxRate

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2.5 text-left hover:border-[var(--color-border-hover)] transition-colors group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Pulsing indicator */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand)] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand)]"></span>
          </span>
          <div className="min-w-0">
            <div className="text-[var(--color-text-muted)] text-[11px] font-medium">
              Infrastructure you rent directly
              <span className="text-[var(--color-text-ghost)] font-normal"> &mdash; not on BleedAI&apos;s invoice</span>
            </div>
            <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5 tabular-nums">
              &asymp;{fmtUSD(domainCost)} one-time + &asymp;{fmtUSD(monthlyInboxCost)}/mo &rarr; your inbox provider
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

      {open && (
        <div className="mt-3">
          <InfraEstimator emailsPerMonth={emailsPerMonth} />
        </div>
      )}
    </div>
  )
}

// ── EPP buttons ───────────────────────────────────────────────────────────────

const EPP_LABELS: Record<number, { label: string; badge?: string }> = {
  1: { label: '1 Email / Prospect' },
  2: { label: '2 Emails / Prospect', badge: 'Recommended' },
  3: { label: '3 Emails / Prospect' },
}

// ── Main section ──────────────────────────────────────────────────────────────

interface MonthTypeSectionProps {
  monthType: MonthType
  inboxOwnership: InboxOwnership
  leads: LeadsPerMonth
  emailsPerProspect: EmailsPerProspect
  totalEmails: number
  pricingResult: PricingResult
  /** Pricing result for the same config as a Normal Month — used by the "Month 2 onwards" card. */
  month2Result: PricingResult | null
  onMonthTypeChange: (v: MonthType) => void
  onInboxChange: (v: InboxOwnership) => void
  onLeadsChange: (v: LeadsPerMonth) => void
  onEmailsChange: (v: EmailsPerProspect) => void
}

const CAPACITY_SLIDER_MIN = 1000
const CAPACITY_SLIDER_MAX = 100000
const CAPACITY_SLIDER_STEP = 500

export function MonthTypeSection({
  monthType,
  inboxOwnership,
  leads: _leads,
  emailsPerProspect,
  totalEmails,
  pricingResult,
  month2Result,
  onMonthTypeChange,
  onInboxChange,
  onLeadsChange,
  onEmailsChange,
}: MonthTypeSectionProps) {
  const isFirstMonthBranded = monthType === 'first_month' && inboxOwnership === 'user_domains'

  // Local slider for Scenario 3 capacity (synced with totalEmails from global state)
  const [capacityEmails, setCapacityEmails] = useState(totalEmails)
  useEffect(() => {
    setCapacityEmails(totalEmails)
  }, [totalEmails])

  // When Scenario 3 capacity slider changes → update global leadsPerMonth
  function handleCapacityChange(v: number) {
    setCapacityEmails(v)
    const newLeads = Math.max(2000, Math.round(v / emailsPerProspect / 500) * 500) as LeadsPerMonth
    onLeadsChange(newLeads)
  }

  // Scenario 3 stats derived from current capacity slider
  const capacityStats = computeBrandedStats(capacityEmails)
  const capacityFillPct = Math.min(100, Math.max(0,
    ((capacityEmails - CAPACITY_SLIDER_MIN) / (CAPACITY_SLIDER_MAX - CAPACITY_SLIDER_MIN)) * 100
  ))

  // Provider-billed costs (NOT on BleedAI's invoice) — shown as "+" rows inside
  // the Pilot / Month 2 cards so clients understand these are separate from BleedAI fees.
  const providerInboxRate = getInboxRate(capacityStats.inboxesNeeded)
  const providerDomainOneTime = capacityStats.domainsNeeded * 12
  const providerInboxMonthly = capacityStats.inboxesNeeded * providerInboxRate
  const providerMonth1Total = providerDomainOneTime + providerInboxMonthly

  // EPP toggle — collapsed by default when user picked the recommended "2 / prospect"
  // (which is most cases); expanded automatically if they've chosen 1 or 3.
  const [eppOpen, setEppOpen] = useState(emailsPerProspect !== 2)
  useEffect(() => {
    if (emailsPerProspect !== 2) setEppOpen(true)
  }, [emailsPerProspect])

  // Setup fee display for Branded radio card
  const setupFeeDisplay = isFirstMonthBranded && pricingResult.brandedSetupFee != null
    ? formatCurrency(pricingResult.brandedSetupFee)
    : formatCurrency(PRICING.brandedSetup.baseSetupFee)

  const MONTH_TABS: { value: MonthType; label: string; sublabel: string }[] = [
    { value: 'first_month', label: 'Pilot Month', sublabel: 'Setup & Launch' },
    { value: 'normal_month', label: 'Normal Month', sublabel: 'Recurring' },
  ]

  const INFRA_OPTIONS: {
    value: InboxOwnership
    label: string
    description: string
    price: string
    priceNote: string
    badge?: string
  }[] = [
    {
      value: 'dfy',
      label: "BleedAI's Warm Infrastructure — Instant Start",
      description:
        "Pre-warmed domains and inboxes ready to send. No setup fees, no warmup delays — your campaign launches at full volume from day 1.",
      price: `$${PRICING.inboxOwnership.dfy}/1k emails`,
      priceNote: '/ month',
      badge: 'Pre-Warmed',
    },
    {
      value: 'user_domains',
      label: "Branded Domains & Inboxes",
      description:
        monthType === 'first_month'
          ? `BleedAI sets up branded sending infrastructure under your domain. Includes 14-day provider warmup + outbound ramp. Setup fee: ${setupFeeDisplay}.`
          : "BleedAI manages campaigns on your branded sending infrastructure. Full capacity from day 1.",
      price: monthType === 'first_month'
        ? `${setupFeeDisplay} setup`
        : `$${PRICING.inboxOwnership.user_domains}/1k emails`,
      priceNote: monthType === 'first_month'
        ? `+ $${PRICING.inboxOwnership.user_domains}/1k emails (month 2+)`
        : '/ month',
    },
  ]

  return (
    <SectionCard
      title="Campaign Setup"
      description="Select the campaign month type and your sending infrastructure."
      illustration={<CampaignSetupIllustration />}
    >
      {/* Month type toggle */}
      <div className="flex rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border-hover)] mb-5">
        {MONTH_TABS.map(({ value, label, sublabel }) => (
          <button
            key={value}
            onClick={() => onMonthTypeChange(value)}
            className={`flex-1 py-3 px-4 text-center transition-all ${
              monthType === value
                ? 'bg-[var(--color-brand)] text-[var(--color-text)]'
                : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs opacity-75 mt-0.5">{sublabel}</div>
          </button>
        ))}
      </div>

      {/* Sending infrastructure */}
      <div className="text-[var(--color-text-ghost)] text-[11px] font-medium uppercase tracking-widest mb-2">
        Sending Infrastructure
      </div>
      <div className="space-y-2">
        {INFRA_OPTIONS.map((opt) => (
          <RadioOption
            key={opt.value}
            name="inbox"
            value={opt.value}
            label={opt.label}
            description={opt.description}
            price={opt.price}
            priceNote={opt.priceNote}
            badge={opt.badge}
            selected={inboxOwnership === opt.value}
            onSelect={() => onInboxChange(opt.value)}
          />
        ))}
      </div>

      {/* ── Scenario 3 only: Pilot Month panel ── */}
      {isFirstMonthBranded && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border-hover)] bg-[var(--color-bg)] p-4 space-y-4">

          {/* Header */}
          <div className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">
            Your Pilot Month &mdash; What You&apos;re Paying For
          </div>

          {/* Target capacity slider */}
          <div>
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-[var(--color-text-ghost)] text-[10px] uppercase tracking-wider">Target capacity</span>
              <span className="text-[var(--color-text)] text-2xl font-bold tabular-nums">
                {capacityEmails.toLocaleString()}
              </span>
              <span className="text-[var(--color-text-muted)] text-sm">emails / month</span>
            </div>
            <p className="text-[var(--color-text-ghost)] text-[11px] mb-2 leading-relaxed">
              We size your infrastructure for this volume. <strong className="text-[var(--color-text-dim)]">Month 1 sends only a fraction</strong> during the 14-day ramp &mdash; then hits full target from month 2 onwards.
            </p>
            <input
              type="range"
              min={CAPACITY_SLIDER_MIN}
              max={CAPACITY_SLIDER_MAX}
              step={CAPACITY_SLIDER_STEP}
              value={capacityEmails}
              onChange={(e) => handleCapacityChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #B1130F ${capacityFillPct}%, rgba(255,255,255,0.1) ${capacityFillPct}%)`,
                accentColor: '#B1130F',
              }}
            />
            <p className="text-[var(--color-text-ghost)] text-[11px] mt-1">
              {Math.round(capacityEmails / emailsPerProspect).toLocaleString()} leads/month · {emailsPerProspect} email{emailsPerProspect > 1 ? 's' : ''}/prospect
            </p>
          </div>

          {/* Emails per prospect — collapsed by default when EPP=2 (recommended) */}
          {eppOpen ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider">
                  Emails per Prospect
                </div>
                {emailsPerProspect === 2 && (
                  <button
                    type="button"
                    onClick={() => setEppOpen(false)}
                    className="text-[var(--color-text-ghost)] hover:text-[var(--color-text-muted)] text-[10px] transition-colors"
                  >
                    collapse
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {EPP_OPTIONS.map((opt) => {
                  const { label, badge } = EPP_LABELS[opt]
                  const isSelected = emailsPerProspect === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => onEmailsChange(opt)}
                      className={`flex-1 px-3 py-2 rounded-[var(--radius-inner)] border text-xs transition-all ${
                        isSelected
                          ? 'border-[var(--color-border-active)] bg-[var(--color-brand-muted)] text-[var(--color-text)] font-medium'
                          : 'border-[var(--color-border-hover)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {label}
                      {badge && (
                        <span className="ml-1 text-[10px] text-[var(--color-brand)] font-semibold">{badge}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEppOpen(true)}
              className="w-full flex items-center justify-between gap-3 rounded-[var(--radius-inner)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 text-left hover:border-[var(--color-border-hover)] transition-colors"
            >
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[var(--color-text-muted)] text-xs font-medium">2 Emails / Prospect</span>
                <span className="text-[var(--color-brand)] text-[10px] font-semibold">Recommended</span>
              </div>
              <span className="text-[var(--color-text-ghost)] text-[10px]">click to change</span>
            </button>
          )}

          {/* ── Two-card layout: Pilot Month vs Month 2+ ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Pilot Month card */}
            <div className="rounded-[var(--radius-inner)] border border-[rgba(177,19,15,0.35)] bg-[var(--color-brand-muted)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[var(--color-brand)] text-[10px] font-semibold uppercase tracking-wider">
                  Pilot Month
                </div>
                <div className="text-[var(--color-text-ghost)] text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-[var(--color-border)]">
                  One-time
                </div>
              </div>
              <div>
                <div className="text-[var(--color-text)] text-2xl md:text-[1.75rem] font-bold tabular-nums leading-none">
                  {formatCurrency(pricingResult.total)}
                </div>
                <div className="text-[var(--color-text-dim)] text-[11px] mt-1.5">
                  <span className="text-[var(--color-text-muted)]">&rarr; BleedAI</span> · billed once for pilot month
                </div>
              </div>
              {/* Cost split: what makes up the pilot total */}
              <div className="pt-2 border-t border-[rgba(177,19,15,0.2)] space-y-1">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="text-[var(--color-text-dim)]">Monthly costs (ramp-billed)</span>
                  <span className="text-[var(--color-text-muted)] font-medium tabular-nums">{formatCurrency(pricingResult.monthlyRecurringTotal)}</span>
                </div>
                {pricingResult.oneTimeTotal > 0 && (
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-[var(--color-text-dim)]">One-time fees</span>
                    <span className="text-[var(--color-text-muted)] font-medium tabular-nums">{formatCurrency(pricingResult.oneTimeTotal)}</span>
                  </div>
                )}
              </div>
              <ul className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 pt-2 border-t border-[rgba(177,19,15,0.2)]">
                <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">&#10003;</span><span>Infrastructure built &amp; warmed (14 days)</span></li>
                <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">&#10003;</span><span><strong className="text-[var(--color-text)]">{capacityStats.month1ActualEmails.toLocaleString()} ramp-phase sends</strong> &mdash; billed on these, not your {capacityEmails.toLocaleString()} target</span></li>
                <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">&#10003;</span><span>{formatCurrency(capacityStats.setupFee)} setup fee included</span></li>
                <li className="flex gap-2"><span className="text-[var(--color-brand)] flex-shrink-0">&#10003;</span><span>One-time add-ons paid now, never again</span></li>
              </ul>
              {/* Provider fee — paid directly, not on BleedAI invoice */}
              <div className="rounded-[var(--radius-inner)] bg-[rgba(0,0,0,0.25)] border border-dashed border-[rgba(177,19,15,0.25)] px-3 py-2 mt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[var(--color-text-dim)] text-[10px] uppercase tracking-wider">+ to your inbox provider</span>
                  <span className="text-[var(--color-text-muted)] text-xs font-semibold tabular-nums">{fmtUSD(providerMonth1Total)}</span>
                </div>
                <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5">
                  {capacityStats.domainsNeeded} domain{capacityStats.domainsNeeded !== 1 ? 's' : ''} ({fmtUSD(providerDomainOneTime)} one-time) + {capacityStats.inboxesNeeded} inbox{capacityStats.inboxesNeeded !== 1 ? 'es' : ''} month 1 ({fmtUSD(providerInboxMonthly)})
                </div>
              </div>
            </div>

            {/* Month 2+ card */}
            <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[var(--color-text-muted)] text-[10px] font-semibold uppercase tracking-wider">
                  Month 2 Onwards
                </div>
                <div className="text-[var(--color-text-ghost)] text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-[var(--color-border)]">
                  Recurring
                </div>
              </div>
              <div>
                <div className="text-[var(--color-text)] text-2xl md:text-[1.75rem] font-bold tabular-nums leading-none">
                  {month2Result ? formatCurrency(month2Result.monthlyRecurringTotal) : '—'}
                </div>
                <div className="text-[var(--color-text-dim)] text-[11px] mt-1.5">
                  <span className="text-[var(--color-text-muted)]">&rarr; BleedAI</span> · recurring, every month
                </div>
              </div>
              <ul className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                <li className="flex gap-2"><span className="text-[var(--color-text-dim)] flex-shrink-0">&#10003;</span><span><strong className="text-[var(--color-text)]">{capacityEmails.toLocaleString()} emails / month</strong> (full target)</span></li>
                <li className="flex gap-2"><span className="text-[var(--color-text-dim)] flex-shrink-0">&#10003;</span><span>Full branded sending from day 1</span></li>
                <li className="flex gap-2"><span className="text-[var(--color-text-dim)] flex-shrink-0">&#10003;</span><span>All selected add-ons &amp; support continue</span></li>
                <li className="flex gap-2"><span className="text-[var(--color-text-dim)] flex-shrink-0">&#10003;</span><span>No setup fees after pilot</span></li>
              </ul>
              {/* Provider fee — paid directly, not on BleedAI invoice */}
              <div className="rounded-[var(--radius-inner)] bg-[rgba(0,0,0,0.25)] border border-dashed border-[var(--color-border)] px-3 py-2 mt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[var(--color-text-dim)] text-[10px] uppercase tracking-wider">+ to your inbox provider</span>
                  <span className="text-[var(--color-text-muted)] text-xs font-semibold tabular-nums">{fmtUSD(providerInboxMonthly)}/mo</span>
                </div>
                <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5">
                  {capacityStats.inboxesNeeded} inbox{capacityStats.inboxesNeeded !== 1 ? 'es' : ''} &mdash; no new domain fees
                </div>
              </div>
            </div>
          </div>

          {/* Timeline — compact context */}
          <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2.5 text-[11px] space-y-1">
            <div className="text-[var(--color-text-dim)] text-[9px] uppercase tracking-wider mb-1.5 font-medium">Pilot Month Timeline</div>
            <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-20 flex-shrink-0">Day 1</span><span className="text-[var(--color-text-dim)]">Infrastructure setup</span></div>
            <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-20 flex-shrink-0">Days 2&ndash;15</span><span className="text-[var(--color-text-dim)]">Provider warmup &mdash; zero sends</span></div>
            <div className="flex gap-2"><span className="text-[var(--color-brand)] w-20 flex-shrink-0">Days 16&ndash;29</span><span className="text-[var(--color-text-muted)]">Outbound ramp &mdash; <strong className="text-[var(--color-text)]">{capacityStats.month1ActualEmails.toLocaleString()} emails sent</strong></span></div>
          </div>

          {/* Collapsible provider cost section */}
          <ProviderCostDisclosure
            emailsPerMonth={capacityEmails}
            inboxes={capacityStats.inboxesNeeded}
            domains={capacityStats.domainsNeeded}
          />

        </div>
      )}
    </SectionCard>
  )
}
