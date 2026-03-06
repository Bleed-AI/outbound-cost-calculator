'use client'

import { useState, useEffect } from 'react'
import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import type { SetupOption } from '@/lib/types'

// ── Infra cost estimator (shown when branded_only is selected) ───────────────

const INFRA_SLIDER_MIN = 500
const INFRA_SLIDER_MAX = 150000
const INFRA_SLIDER_STEP = 500

function getInboxRate(inboxCount: number): number {
  if (inboxCount >= 100) return 3.00
  if (inboxCount >= 30) return 3.25
  return 3.50
}

function fmtUSD(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString()}` : `$${n.toFixed(2)}`
}

function InfraEstimator({ totalEmails }: { totalEmails: number }) {
  const [emailsPerMonth, setEmailsPerMonth] = useState(totalEmails)

  // Stay in sync with campaign volume changes
  useEffect(() => {
    setEmailsPerMonth(totalEmails)
  }, [totalEmails])

  const inboxes = Math.floor(emailsPerMonth / 500)
  const domains = Math.floor(emailsPerMonth / 1500)
  const inboxRate = getInboxRate(inboxes)
  const domainCost = domains * 12
  const monthlyInboxCost = inboxes * inboxRate
  const fillPct = Math.min(100, Math.max(0,
    ((emailsPerMonth - INFRA_SLIDER_MIN) / (INFRA_SLIDER_MAX - INFRA_SLIDER_MIN)) * 100
  ))

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-[#050508] p-4 space-y-5">
      {/* Emails per month slider */}
      <div>
        <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3 block">
          Emails to Send per Month
        </label>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-white text-xl font-bold tabular-nums">
            {emailsPerMonth.toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm">emails / month</span>
        </div>
        <input
          type="range"
          min={INFRA_SLIDER_MIN}
          max={INFRA_SLIDER_MAX}
          step={INFRA_SLIDER_STEP}
          value={emailsPerMonth}
          onChange={(e) => setEmailsPerMonth(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #B1130F ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`,
            accentColor: '#B1130F',
          }}
        />
        <p className="text-gray-600 text-[11px] mt-2">
          Each inbox sends ≈ 25 emails/day (500/month over 20 working days) · 3 inboxes per domain
        </p>
      </div>

      {/* Cost cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Domains Needed</div>
          <div className="text-white text-2xl font-bold tabular-nums">{domains}</div>
          <div className="text-gray-500 text-[11px]">$12 / domain · one-time</div>
          <div className="pt-1.5 border-t border-white/5 flex items-baseline gap-1">
            <span className="text-white font-semibold text-sm">{fmtUSD(domainCost)}</span>
            <span className="text-gray-500 text-xs">one-time</span>
          </div>
        </div>

        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Inboxes Needed</div>
          <div className="text-white text-2xl font-bold tabular-nums">{inboxes}</div>
          <div className="text-gray-500 text-[11px]">
            {fmtUSD(inboxRate)} / inbox / month
            {inboxes >= 30 && (
              <span className="ml-1 text-green-500/70">(volume rate)</span>
            )}
          </div>
          <div className="pt-1.5 border-t border-white/5 flex items-baseline gap-1">
            <span className="text-white font-semibold text-sm">{fmtUSD(monthlyInboxCost)}</span>
            <span className="text-gray-500 text-xs">/ month</span>
          </div>
        </div>
      </div>

      {/* Pricing tiers note */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-gray-500 space-y-0.5">
        <div className="font-medium text-gray-400 mb-1">Inbox pricing tiers</div>
        <div className={inboxes < 30 ? 'text-gray-400' : ''}>1–29 inboxes: $3.50 / inbox / month</div>
        <div className={inboxes >= 30 && inboxes < 100 ? 'text-gray-400' : ''}>30–99 inboxes: $3.25 / inbox / month</div>
        <div className={inboxes >= 100 ? 'text-gray-400' : ''}>100+ inboxes: $3.00 / inbox / month</div>
      </div>

      {/* Disclaimer */}
      <p className="text-gray-600 text-[11px] italic">
        * These costs are paid directly to your domain and inbox provider — not included in the BleedAI service total above.
      </p>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────

const OPTIONS: { value: SetupOption; label: string; description: string; price: string; priceNote: string }[] = [
  {
    value: 'none',
    label: 'No setup help needed',
    description: "I don't need to build custom infrastructure.",
    price: '$0',
    priceNote: '',
  },
  {
    value: 'full_dfy',
    label: 'Full DFY Instantly System Setup',
    description:
      'BleedAI builds your complete Instantly.ai setup: branded domains and inboxes, DKIM/SPF/DMARC configuration, profile names, photos, signatures, account warm-up, and SOPs for running the system.',
    price: '$400',
    priceNote: 'one-time',
  },
  {
    value: 'branded_only',
    label: 'Branded Domains & Inboxes Only',
    description:
      'BleedAI creates your branded domains and inboxes with full DKIM/SPF/DMARC, profile names, photos, and signatures. Infrastructure is ready to use — Instantly.ai integration not included.',
    price: '$250',
    priceNote: 'one-time',
  },
]

interface SetupSectionProps {
  value: SetupOption
  totalEmails: number
  onChange: (v: SetupOption) => void
}

export function SetupSection({ value, totalEmails, onChange }: SetupSectionProps) {
  return (
    <SectionCard
      title="Infrastructure Setup"
      description="Does BleedAI need to build your sending infrastructure, or do you already have it?"
      optional
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <RadioOption
            key={opt.value}
            name="setup"
            value={opt.value}
            label={opt.label}
            description={opt.description}
            price={opt.price}
            priceNote={opt.priceNote}
            selected={value === opt.value}
            onSelect={() => onChange(opt.value)}
          />
        ))}
      </div>
      {value === 'branded_only' && <InfraEstimator totalEmails={totalEmails} />}
    </SectionCard>
  )
}
