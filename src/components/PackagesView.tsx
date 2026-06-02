'use client'

import { useState } from 'react'
import { motion, LazyMotion, domAnimation } from 'framer-motion'
import { InquiryModal, type InquiryContext } from '@/components/InquiryModal'
import { ResultsGallery } from '@/components/ResultsGallery'

interface PackageTier {
  id: 'pilot' | 'growth' | 'scale'
  name: string
  price: string
  priceNote: string
  positioning: string
  features: string[]
  /** Visually emphasize this tier — uses brand accent on price/border. */
  emphasis?: boolean
}

const TIERS: PackageTier[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    price: '$1,500',
    priceNote: '/ month',
    positioning: 'Entry-level monthly package for teams who want a working outbound machine — but at lower volume to start.',
    features: [
      'All associated costs, prospecting, system & infrastructure',
      'Your branded domains & inboxes',
      'Send up to **10k emails / month**',
      'One winning campaign running steady — no monthly experimentation',
      'Automated client responses with AI agents',
      'Follow-up strategy for hot leads',
      'Email support throughout',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$2,450',
    priceNote: '/ month',
    positioning: 'Built for teams who want a complete outbound machine — branded infra, ongoing experiments, full ops, every month.',
    features: [
      'Everything in Pilot',
      'Send up to **20k–30k emails / month**',
      'Test new market segments for your offer **every month**',
      'Run **multiple experiments** to discover winning campaigns',
      'Scale winning campaigns aggressively',
      'Slack support, 5 days a week',
    ],
    emphasis: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$3,450',
    priceNote: '/ month',
    positioning: 'For teams ready to scale volume or pressure-test multiple value props in parallel.',
    features: [
      'Everything in Growth',
      'Additional experiments testing new value props in new markets — **OR** scale prospect volume to **50k–60k emails / month**',
      'Help creating **advanced reverse lead magnets**',
      'Experimenting with **advanced signal-based campaigns**',
    ],
  },
]

export function PackagesView() {
  const [inquiry, setInquiry] = useState<InquiryContext | null>(null)

  return (
    <LazyMotion features={domAnimation}>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">

        {/* Intro paragraph */}
        <div className="max-w-2xl mb-10">
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
            Our premium packages run <span className="text-[var(--color-text)] font-medium">end-to-end monthly outbound</span> for you — full ops, ongoing experiments, scaling what wins. Pick the tier that fits your stage.
          </p>
          <p className="text-[var(--color-text-dim)] text-xs mt-2 leading-relaxed">
            Want to test the model first? Run a <a href="/trials" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">Trial Campaign</a>. Just need a single send? <a href="/" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">Configure a one-off campaign</a>.
          </p>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TierCard tier={tier} onInquire={() => setInquiry({
                kind: 'package',
                tierLabel: `${tier.name} Package`,
                priceLabel: `${tier.price}${tier.priceNote}`,
                metadata: { tier: tier.id },
              })} />
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
            <h3 className="text-[var(--color-text)] font-medium text-sm tracking-tight">How most clients get here</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <Step n="1" title="Trial Campaign" body="A short, focused test — we run experiments on our infrastructure to validate cold email works for your business." href="/trials" />
            <Step n="2" title="We Find What Works" body="Pause when we hit results. Or pivot if early signals say no — no commitments either way." />
            <Step n="3" title="Move to a Package" body="Once validated, move to a monthly package to run the winning playbook at scale, every month." />
          </div>
        </motion.div>
      </div>

      {/* Campaign snapshots — reuse existing gallery */}
      <ResultsGallery />

      {inquiry && (
        <InquiryModal context={inquiry} onClose={() => setInquiry(null)} />
      )}
    </LazyMotion>
  )
}

/* ── Tier card ─────────────────────────────────────────── */

function TierCard({ tier, onInquire }: { tier: PackageTier; onInquire: () => void }) {
  const accent = tier.emphasis
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

        {/* Tier name */}
        <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] mb-3 ${
          accent ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-ghost)]'
        }`}>
          {tier.name}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className={`text-4xl font-bold tabular-nums font-[family-name:var(--font-mono)] tracking-tight ${
            accent ? 'text-[var(--color-text)]' : 'text-[var(--color-text)]'
          }`}>
            {tier.price}
          </span>
          <span className="text-[var(--color-text-dim)] text-sm">{tier.priceNote}</span>
        </div>

        {/* Positioning */}
        <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mb-5 min-h-[3rem]">
          {tier.positioning}
        </p>

        {/* Divider */}
        <div className={`h-px ${
          accent
            ? 'bg-gradient-to-r from-[var(--color-brand)] via-[rgba(177,19,15,0.3)] to-transparent'
            : 'bg-[var(--color-border)]'
        } mb-5`} />

        {/* Features */}
        <ul className="space-y-2.5 mb-7 flex-1">
          {tier.features.map((feat, i) => (
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
          Get Started →
        </button>
      </div>
    </div>
  )
}

/* Render **markdown bold** within feature strings into <strong> tags. */
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

/* ── Step ─────────────────────────────────────────────── */

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
