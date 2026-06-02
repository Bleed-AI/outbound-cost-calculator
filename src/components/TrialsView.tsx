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
    positioning: 'For when you have a clear hypothesis about your best one or two ICPs — we validate them fast and confirm the signal.',
    prices: { high: 580, mid: 465, low: 350 },
    features: [
      '**No warmup wait** — we launch on pre-warmed accounts from day 1',
      'We handle everything — copy, leads, sending, replies',
      '**Hot leads forwarded to you** as they come in',
      'Stop on signal — when we find traction or determine no fit',
      'Strategy call at kickoff to nail ICP + offer',
    ],
  },
  {
    id: 'large',
    name: '3–5 Trial Campaigns',
    duration: 'up to 4 weeks',
    experimentCountLabel: '3–5 experiments',
    positioning: 'Higher chance of finding a winner — we test multiple markets in parallel so you discover which segment actually responds.',
    prices: { high: 1100, mid: 1000, low: 900 },
    features: [
      'Everything in the smaller package',
      '**3–5 different ICPs / segments tested simultaneously**',
      'Best when your offer could hit multiple markets and you want data',
      'Significantly higher probability of finding a winning angle',
      'Detailed breakdown of which segment performed best',
    ],
    emphasis: true,
  },
]

function isPriceTier(s: string | null): s is PriceTier {
  return s === 'high' || s === 'mid' || s === 'low'
}

const TIER_LABEL: Record<PriceTier, string> = {
  high: 'standard',
  mid: 'mid',
  low: 'low',
}

export function TrialsView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialTier: PriceTier = isPriceTier(searchParams.get('p')) ? (searchParams.get('p') as PriceTier) : 'high'
  const [priceTier, setPriceTier] = useState<PriceTier>(initialTier)

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

  // Keyboard shortcut for screen-share use — Shift+P cycles price tiers.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'P') {
        e.preventDefault()
        cyclePriceTier()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cyclePriceTier])

  const [inquiry, setInquiry] = useState<InquiryContext | null>(null)

  return (
    <LazyMotion features={domAnimation}>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">

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

        {/* Already-validated CTA — link back to calculator for complete one-off campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 rounded-[var(--radius-inner)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-surface-0)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <div className="text-[var(--color-text)] text-sm font-medium">Already know cold outreach works for you?</div>
            <div className="text-[var(--color-text-dim)] text-xs mt-1">Skip trials — configure and price a complete one-off campaign instead.</div>
          </div>
          <a
            href="/"
            className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-semibold text-sm inline-flex items-center gap-1 whitespace-nowrap"
          >
            Configure a one-off campaign
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-6 py-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
            <h3 className="text-[var(--color-text)] font-medium text-sm tracking-tight">How a trial campaign runs</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <Step n="1" title="Kickoff call" body="We align on your ICPs, offer, and the angles we&apos;ll test. Then we launch — same day or next." />
            <Step n="2" title="Experiments run" body="Multiple campaigns in parallel on our pre-warmed accounts. Hot leads forwarded as they come in." />
            <Step n="3" title="Report + next step" body="Clear data on what hit. Move to a monthly package, run more trials, or take your winning playbook elsewhere." href="/packages" />
          </div>
        </motion.div>

      </div>

      {/* Hidden tier-cycle button — small icon at bottom-right. Title attr serves as discoverability hint. */}
      <button
        onClick={cyclePriceTier}
        aria-label="Cycle price tier (also: Shift+P)"
        title={`Pricing tier: ${TIER_LABEL[priceTier]} · click or press Shift+P to cycle`}
        className="fixed bottom-4 right-4 w-7 h-7 rounded-full bg-[var(--color-surface-0)] border border-[var(--color-border-hover)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-muted)] text-[var(--color-text-ghost)] hover:text-[var(--color-brand)] flex items-center justify-center transition-all opacity-50 hover:opacity-100 cursor-pointer z-30"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z M9 12h6 M12 9v6" />
        </svg>
      </button>

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

        {/* Header row */}
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

        <div className="text-[var(--color-text)] text-lg font-semibold mb-1">{pkg.name}</div>

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

        <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mb-5 min-h-[3rem]">
          {pkg.positioning}
        </p>

        <div className={`h-px ${
          accent
            ? 'bg-gradient-to-r from-[var(--color-brand)] via-[rgba(177,19,15,0.3)] to-transparent'
            : 'bg-[var(--color-border)]'
        } mb-5`} />

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

        <button
          onClick={onInquire}
          className={`w-full font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-all text-sm ${
            accent
              ? 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[#9a0f0c] text-white'
              : 'bg-[var(--color-bg)] hover:bg-[var(--color-brand-muted)] border border-[var(--color-border-hover)] hover:border-[var(--color-brand)] text-[var(--color-text)]'
          }`}
        >
          Start Your Trial →
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
