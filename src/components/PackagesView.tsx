'use client'

import { useState } from 'react'
import { motion, LazyMotion, domAnimation } from 'framer-motion'
import { InquiryModal, type InquiryContext } from '@/components/InquiryModal'
import { ResultsGallery } from '@/components/ResultsGallery'
import { ToolStack } from '@/components/ToolStack'

interface PackageTier {
  id: 'pilot' | 'growth' | 'scale'
  name: string
  price: string
  priceNote: string
  /** The hero line — what kind of strategic play this tier runs. This is the
   *  primary differentiator, NOT email volume. */
  headline: string
  /** Strategic effort / complexity level 1–3 — drives the effort meter. */
  effort: 1 | 2 | 3
  positioning: string
  features: string[]
  /** Email throughput — deliberately demoted to a muted side-detail. Volume is a
   *  byproduct of the strategy, never the reason to size up. */
  volumeNote: string
  /** Visually emphasize this tier — uses brand accent on price/border. */
  emphasis?: boolean
}

const TIERS: PackageTier[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    price: '$1,500',
    priceNote: '/ month',
    headline: 'One proven campaign, dialed in and run for you.',
    effort: 1,
    positioning: 'For teams who want a real outbound machine running against one core market — focused and steady, no constant experimentation.',
    features: [
      'All associated costs, prospecting, system & infrastructure',
      'Your branded domains & inboxes',
      'One **sharp campaign** against a single core ICP, run steady',
      'Full **DFY sourcing** — Claygent, Prospeo & our directory stack',
      'Automated client responses with AI agents',
      'Follow-up strategy for hot leads',
      'Dedicated Slack support throughout',
    ],
    volumeNote: 'Sending scales to fit the play — up to ~10k emails / mo. Want fewer? We size it down.',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$2,450',
    priceNote: '/ month',
    headline: 'Multiple segments and angles, tested every month.',
    effort: 2,
    positioning: 'For teams who want us actively hunting — new markets, directories and geographies probed monthly to find what wins.',
    features: [
      'Everything in Pilot',
      'Test **new market segments** for your offer every month',
      '**Multiple experiments** across directories, niches & geographies',
      '**Signal layers** added wherever they sharpen targeting',
      'Scale winning campaigns aggressively',
      'Slack support, 5 days a week',
    ],
    volumeNote: 'More plays in flight naturally means more sending — typically ~20k–30k emails / mo.',
    emphasis: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$3,450',
    priceNote: '/ month',
    headline: 'High-effort, multi-signal campaigns at full strategic depth.',
    effort: 3,
    positioning: 'For teams who want the hardest, most strategic plays run in parallel — advanced intent signals and reverse lead magnets, built fresh each month.',
    features: [
      'Everything in Growth',
      '**Advanced signal-based campaigns** — multiple intent signals layered per play',
      'Help creating **advanced reverse lead magnets**',
      '**New value props** pressure-tested in new markets, in parallel',
      'The most build time and strategic effort we put in, every month',
    ],
    volumeNote: 'Capacity for up to ~50k–60k emails / mo when a play calls for it — never the reason to be here.',
  },
]

export function PackagesView() {
  const [inquiry, setInquiry] = useState<InquiryContext | null>(null)

  return (
    <LazyMotion features={domAnimation}>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">

        {/* Short lead-in — the effort-over-volume thesis already lives in the hero,
            so this stays tight and just frames the choice + the off-ramps. */}
        <div className="max-w-2xl mb-9">
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
            Every tier is the <span className="text-[var(--color-text)] font-medium">full machine</span> — sourcing, copy, infrastructure and experiments, run for you each month. You&rsquo;re choosing the <span className="text-[var(--color-text)] font-medium">level of effort your market needs</span>, not a bigger email number.
          </p>
          <p className="text-[var(--color-text-dim)] text-xs mt-2.5 leading-relaxed">
            Not ready for a monthly engagement? <a href="/trials" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">Validate with a Trial Campaign</a>, or <a href="/" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">scope a single targeted campaign</a>.
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

        {/* Volume footnote — reinforces that throughput is a byproduct, not the axis */}
        <p className="mt-5 mb-12 text-[var(--color-text-ghost)] text-xs leading-relaxed max-w-3xl">
          Email volume rises with each tier, but it&rsquo;s a consequence of running more and harder campaigns — never a reason on its own to size up. Tell us the markets you want hit and we&rsquo;ll right-size the sending.
        </p>

        {/* The real tool stack — premium credibility */}
        <ToolStack />

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

/* ── Effort meter ──────────────────────────────────────── */

function EffortMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex gap-1" role="img" aria-label={`Strategic effort level ${level} of 3`}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-3 w-6 rounded-[3px] transition-colors ${
              i <= level ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]'
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-ghost)]">
        Effort &amp; strategy
      </span>
    </div>
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
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl font-bold tabular-nums font-[family-name:var(--font-mono)] tracking-tight text-[var(--color-text)]">
            {tier.price}
          </span>
          <span className="text-[var(--color-text-dim)] text-sm">{tier.priceNote}</span>
        </div>

        {/* Headline — the primary differentiator */}
        <p className="text-[var(--color-text)] text-[15px] font-semibold leading-snug mb-4 min-h-[2.75rem]">
          {tier.headline}
        </p>

        {/* Effort meter */}
        <EffortMeter level={tier.effort} />

        {/* Positioning */}
        <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mb-5 min-h-[3.5rem]">
          {tier.positioning}
        </p>

        {/* Divider */}
        <div className={`h-px ${
          accent
            ? 'bg-gradient-to-r from-[var(--color-brand)] via-[rgba(177,19,15,0.3)] to-transparent'
            : 'bg-[var(--color-border)]'
        } mb-5`} />

        {/* Features */}
        <ul className="space-y-2.5 mb-5 flex-1">
          {tier.features.map((feat, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              <svg className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${accent ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-dim)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: renderInlineEmphasis(feat) }} />
            </li>
          ))}
        </ul>

        {/* Volume — demoted side-detail */}
        <div className="flex items-start gap-2 mb-5 text-[11px] leading-relaxed text-[var(--color-text-ghost)]">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-px opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{tier.volumeNote}</span>
        </div>

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
