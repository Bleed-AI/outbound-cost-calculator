'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, LazyMotion, domAnimation } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { InquiryModal, type InquiryContext } from '@/components/InquiryModal'

type PriceTier = 'high' | 'mid' | 'low'

const TIER_CYCLE: PriceTier[] = ['high', 'mid', 'low']

interface TrialPackage {
  id: 'small' | 'large'
  name: string
  duration: string
  experimentCountLabel: string
  positioning: string
  prices: Record<PriceTier, number>
  features: string[]
  emphasis?: boolean
}

const PACKAGES: TrialPackage[] = [
  {
    id: 'small',
    name: '1–2 Trial Campaigns',
    duration: 'up to 2 weeks',
    experimentCountLabel: '1–2 experiments',
    positioning: 'A short, focused test to validate one or two angles. Best when you want a quick read on whether cold email can work.',
    prices: { high: 850, mid: 600, low: 350 },
    features: [
      'We handle **everything** — lead sourcing, copy, sending infra',
      'Runs on our **pre-warmed** infrastructure (no setup delays)',
      'Stops when we **find traction** or **determine no fit** — your call to continue',
      'Direct **strategy call** at the start to nail the ICP and offer',
      'After: clear next-step recommendation — package upgrade or pivot',
    ],
  },
  {
    id: 'large',
    name: '3–5 Trial Campaigns',
    duration: 'up to 4 weeks',
    experimentCountLabel: '3–5 experiments',
    positioning: 'Multiple parallel experiments testing different ICPs, offers, and messaging — best when fit is uncertain or markets are nuanced.',
    prices: { high: 1200, mid: 900, low: 550 },
    features: [
      'Everything in the smaller package',
      '**Multiple parallel experiments** — different ICPs, offers, hooks',
      'Higher confidence we find the angle that works',
      'Built for businesses where outbound fit is **not obvious yet**',
      'Stops on the same conditions — we hit results, or we determine no fit',
    ],
    emphasis: true,
  },
]

function isPriceTier(s: string | null): s is PriceTier {
  return s === 'high' || s === 'mid' || s === 'low'
}

export function TrialsView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // URL param `p` is the source of truth for the price tier.
  // Default is 'high' — what public visitors see.
  const initialTier: PriceTier = isPriceTier(searchParams.get('p')) ? (searchParams.get('p') as PriceTier) : 'high'
  const [priceTier, setPriceTier] = useState<PriceTier>(initialTier)

  // Sync URL when tier changes (without triggering a scroll)
  useEffect(() => {
    const newUrl = priceTier === 'high' ? '/trials' : `/trials?p=${priceTier}`
    router.replace(newUrl, { scroll: false })
  }, [priceTier, router])

  const cyclePriceTier = useCallback(() => {
    setPriceTier((cur) => {
      const i = TIER_CYCLE.indexOf(cur)
      return TIER_CYCLE[(i + 1) % TIER_CYCLE.length]
    })
  }, [])

  const [inquiry, setInquiry] = useState<InquiryContext | null>(null)

  return (
    <LazyMotion features={domAnimation}>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">

        {/* Intro */}
        <div className="max-w-2xl mb-10">
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
            Trial campaigns are <span className="text-[var(--color-text)] font-medium">short, focused experiments</span> on our pre-warmed infrastructure. We start fast, prove (or disprove) cold email for your business, and only continue when there&apos;s real signal. After success, clients typically move to a <a href="/packages" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">retainer package</a>.
          </p>
        </div>

        {/* Two pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch">
          {PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TrialCard
                pkg={pkg}
                priceTier={priceTier}
                onInquire={() => setInquiry({
                  kind: 'trial',
                  tierLabel: pkg.name,
                  priceLabel: `$${pkg.prices[priceTier].toLocaleString()}`,
                  metadata: { package: pkg.id, priceTier, price: pkg.prices[priceTier] },
                })}
              />
            </motion.div>
          ))}
        </div>

        {/* Journey explainer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-6 py-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
            <h3 className="text-[var(--color-text)] font-medium text-sm tracking-tight">What happens after a trial</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <Step n="1" title="We Run Experiments" body="We handle copy, lead data, sends — testing different angles on our infrastructure." />
            <Step n="2" title="We Stop on Signal" body="Either we hit traction → time to scale. Or we determine no fit → you stop without further commitment." />
            <Step n="3" title="Move to a Package" body="If trials prove ROI, graduate to a monthly retainer to run the winning playbook every month." href="/packages" />
          </div>
        </motion.div>

        {/* Alternative path: link to calculator */}
        <div className="mt-8 text-center text-[var(--color-text-dim)] text-xs">
          Already decided you want cold outbound and ready to commit?{' '}
          <a href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium underline-offset-4 hover:underline">
            Configure a one-off campaign →
          </a>
        </div>

      </div>

      {/* Hidden tier-cycle button — subtle dot in the footer area, used during screenshares */}
      <button
        onClick={cyclePriceTier}
        aria-label="Cycle price tier"
        title={`Current: ${priceTier} · click to cycle`}
        className="fixed bottom-3 right-3 w-2 h-2 rounded-full bg-[rgba(177,19,15,0.3)] hover:bg-[var(--color-brand)] transition-all opacity-30 hover:opacity-90 cursor-pointer"
      />

      {inquiry && (
        <InquiryModal context={inquiry} onClose={() => setInquiry(null)} />
      )}
    </LazyMotion>
  )
}

/* ── Trial card ───────────────────────────────────────── */

function TrialCard({ pkg, priceTier, onInquire }: {
  pkg: TrialPackage
  priceTier: PriceTier
  onInquire: () => void
}) {
  const accent = pkg.emphasis
  const price = pkg.prices[priceTier]

  return (
    <div className={`relative h-full rounded-[var(--radius-card)] border ${
      accent
        ? 'border-[rgba(177,19,15,0.4)] bg-gradient-to-br from-[var(--color-brand-muted)] to-[var(--color-surface-1)]'
        : 'border-[var(--color-border)] bg-[var(--color-surface-0)]'
    } p-px overflow-hidden transition-all hover:border-[var(--color-border-active)]`}>
      {accent && (
        <div className="absolute -top-24 -right-20 w-48 h-48 rounded-full bg-[var(--color-brand)] opacity-[0.08] blur-[80px] pointer-events-none" />
      )}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative h-full rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] px-6 py-7 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
            accent ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-ghost)]'
          }`}>
            {pkg.experimentCountLabel}
          </div>
          <div className="text-[var(--color-text-ghost)] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--color-border)]">
            {pkg.duration}
          </div>
        </div>

        {/* Name */}
        <div className="text-[var(--color-text)] text-lg font-semibold mb-1">{pkg.name}</div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <motion.span
            key={priceTier}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold tabular-nums font-[family-name:var(--font-mono)] tracking-tight text-[var(--color-text)]"
          >
            ${price.toLocaleString()}
          </motion.span>
          <span className="text-[var(--color-text-dim)] text-sm">one-time</span>
        </div>

        {/* Positioning */}
        <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mb-5 min-h-[3rem]">
          {pkg.positioning}
        </p>

        {/* Divider */}
        <div className={`h-px ${
          accent
            ? 'bg-gradient-to-r from-[var(--color-brand)] via-[rgba(177,19,15,0.3)] to-transparent'
            : 'bg-[var(--color-border)]'
        } mb-5`} />

        {/* Features */}
        <ul className="space-y-2.5 mb-7 flex-1">
          {pkg.features.map((feat, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              <svg className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${accent ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-dim)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: renderInlineEmphasis(feat) }} />
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onInquire}
          className={`w-full font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-all text-sm ${
            accent
              ? 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[#9a0f0c] text-white'
              : 'bg-[var(--color-bg)] hover:bg-[var(--color-brand-muted)] border border-[var(--color-border-hover)] hover:border-[var(--color-brand)] text-[var(--color-text)]'
          }`}
        >
          Book a Strategy Call
        </button>
      </div>
    </div>
  )
}

function renderInlineEmphasis(input: string): string {
  return escapeHtml(input).replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--color-text)] font-semibold">$1</strong>')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function Step({ n, title, body, href }: { n: string; title: string; body: string; href?: string }) {
  const content = (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.3)] text-[var(--color-brand)] text-[10px] font-bold">{n}</span>
        <span className="text-[var(--color-text)] font-medium text-sm">{title}</span>
      </div>
      <p className="text-[var(--color-text-dim)] text-xs leading-relaxed pl-7">{body}</p>
    </>
  )
  if (href) {
    return (
      <a href={href} className="block group hover:bg-[var(--color-surface-0)] rounded-[var(--radius-inner)] -mx-2 px-2 py-1 transition-colors">
        {content}
      </a>
    )
  }
  return <div className="px-2 py-1">{content}</div>
}
