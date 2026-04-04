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

      {/* ── Scenario 3 only: single unified panel ── */}
      {isFirstMonthBranded && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border-hover)] bg-[var(--color-bg)] p-4 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">
              Month 1 Setup &amp; Capacity
            </div>
            <div className="text-[var(--color-text-ghost)] text-[11px]">
              Setup fee: <span className="text-[var(--color-text-muted)] font-medium">{formatCurrency(capacityStats.setupFee)}</span>
              {capacityStats.inboxesNeeded > PRICING.brandedSetup.extraInboxThreshold && (
                <span className="text-[var(--color-text-ghost)] ml-1">
                  ($250 + {capacityStats.inboxesNeeded - PRICING.brandedSetup.extraInboxThreshold}×$2)
                </span>
              )}
            </div>
          </div>

          {/* Capacity slider */}
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[var(--color-text)] text-2xl font-bold tabular-nums">
                {capacityEmails.toLocaleString()}
              </span>
              <span className="text-[var(--color-text-muted)] text-sm">emails / month (month 2+ full capacity)</span>
            </div>
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

          {/* Emails per prospect */}
          <div>
            <div className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider mb-2">
              Emails per Prospect
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

          {/* Timeline */}
          <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2.5 text-[11px] space-y-1">
            <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-16 flex-shrink-0">Day 1</span><span className="text-[var(--color-text-dim)]">Infrastructure setup</span></div>
            <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-16 flex-shrink-0">Days 2–15</span><span className="text-[var(--color-text-dim)]">Provider inbox warmup — zero outbound sends</span></div>
            <div className="flex gap-2"><span className="text-[var(--color-brand)] w-16 flex-shrink-0">Days 16–29</span><span className="text-[var(--color-text-muted)]">Outbound ramp — <strong className="text-[var(--color-text)]">{capacityStats.month1ActualEmails.toLocaleString()} emails sent</strong></span></div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 text-center">
              <div className="text-[var(--color-text-dim)] text-[10px] uppercase tracking-wider">Inboxes</div>
              <div className="text-[var(--color-text)] text-lg font-bold tabular-nums">{capacityStats.inboxesNeeded}</div>
              <div className="text-[var(--color-text-ghost)] text-[10px]">{capacityStats.domainsNeeded} domain{capacityStats.domainsNeeded !== 1 ? 's' : ''}</div>
            </div>
            <div className="col-span-2 rounded-[var(--radius-inner)] border border-[rgba(177,19,15,0.2)] bg-[var(--color-brand-muted)] px-3 py-2 text-center">
              <div className="text-[var(--color-text-dim)] text-[10px] uppercase tracking-wider">Month 1 Emails Sent</div>
              <div className="text-[var(--color-text)] text-lg font-bold tabular-nums">{capacityStats.month1ActualEmails.toLocaleString()}</div>
              <div className="text-[var(--color-brand)] text-[10px] font-medium">billed on this</div>
            </div>
            <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 text-center">
              <div className="text-[var(--color-text-dim)] text-[10px] uppercase tracking-wider">Setup Fee</div>
              <div className="text-[var(--color-text)] text-lg font-bold tabular-nums">{formatCurrency(capacityStats.setupFee)}</div>
              <div className="text-[var(--color-text-ghost)] text-[10px]">one-time</div>
            </div>
          </div>

          <p className="text-[var(--color-text-ghost)] text-[11px] italic">
            Month 1 billing is based on emails sent during the 14-day ramp phase only. Full sending capacity begins from month 2.
          </p>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)]" />

          {/* Provider cost sub-section */}
          <div>
            <div className="text-[var(--color-text-ghost)] text-[11px] font-medium uppercase tracking-wider mb-3">
              Your Provider Cost Estimate
              <span className="ml-2 normal-case tracking-normal font-normal text-[var(--color-text-ghost)]">
                (paid to your inbox provider — not included in BleedAI total)
              </span>
            </div>
            <InfraEstimator emailsPerMonth={capacityEmails} />
          </div>

        </div>
      )}
    </SectionCard>
  )
}
