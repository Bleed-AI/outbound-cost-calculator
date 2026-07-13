'use client'

import { useState } from 'react'
import { motion, LazyMotion, domAnimation } from 'framer-motion'
import { InquiryModal, type InquiryContext } from '@/components/InquiryModal'
import { ResultsGallery } from '@/components/ResultsGallery'
import { ToolStack } from '@/components/ToolStack'

interface PackageTier {
  id: 'growth' | 'scale'
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
    id: 'growth',
    name: 'Growth',
    price: '$3,350',
    priceNote: '/ month',
    headline: 'Multiple segments and angles, tested every month.',
    effort: 2,
    positioning: 'For teams who want us actively hunting, new markets, directories and geographies probed every month to find what wins, with the whole outbound machine run for you.',
    features: [
      '**All domains and inbox fees covered**: every cost, prospecting & infrastructure included, nothing billed on top',
      'Full **DFY sourcing** across Clay, Prospeo & our directory stack',
      'AI reply agent working every inbound reply',
      '**Multiple experiments** every month across new segments, directories & geographies',
      '**Signal layers** added wherever they sharpen targeting',
      'Engineered, **context-based sub-sequences** that warm interested leads into booked calls',
      'Winning campaigns scaled aggressively',
      'Dedicated Slack support, 5 days a week',
    ],
    volumeNote: 'More plays in flight naturally means more sending, typically ~30k-40k emails / mo.',
    emphasis: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$5,300',
    priceNote: '/ month',
    headline: 'Multi-channel campaigns at full strategic depth.',
    effort: 3,
    positioning: 'For teams who want every channel working in parallel: the hardest strategic plays, fresh intent signals, advanced targeting, and reverse lead magnets where a campaign calls for one.',
    features: [
      'Everything in Growth',
      '**Multi-touch across channels**: LinkedIn connection requests, SMS touchpoints and optional call integrations, orchestrated at the CRM level',
      '**LinkedIn touchpoints** on your interested leads, not just email',
      '**Advanced signal-based campaigns**, multiple intent signals layered per play',
      'Help building **advanced reverse lead magnets** where they fit',
      '**New value props** pressure-tested in new markets, in parallel',
      'The most build time and strategic effort we put in, every month',
    ],
    volumeNote: 'Capacity for up to ~50k-75k emails / mo when a play calls for it, never the reason to be here.',
  },
]

export function PackagesView() {
  const [inquiry, setInquiry] = useState<InquiryContext | null>(null)

  return (
    <LazyMotion features={domAnimation}>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">

        {/* Lead-in after the hero — frames the off-ramps and leads into the tiers */}
        <p className="max-w-2xl mb-7 text-[var(--color-text-dim)] text-sm leading-relaxed">
          You can prove it first with{' '}
          <a href="/sprint" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">The Outbound Sprint</a>{' '}or a{' '}
          <a href="/" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">single one-off</a>, then move to a monthly tier once it&rsquo;s working. Already sure? Pick your level of effort below.
        </p>

        {/* Compact tool stack — sits ABOVE the cards so the stack and all
            pricing tiers are visible on load. */}
        <div className="mb-8">
          <ToolStack />
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch max-w-3xl mx-auto">
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

        {/* Footnote + off-ramps — cleanly grouped below the cards */}
        <div className="mt-6 max-w-3xl space-y-2.5">
          <p className="text-[var(--color-text-ghost)] text-xs leading-relaxed">
            Email volume rises with each tier, but it&rsquo;s a consequence of running more and harder campaigns, never a reason on its own to size up. Tell us the markets you want hit and we&rsquo;ll right-size the sending.
          </p>
          <p className="text-[var(--color-text-dim)] text-xs leading-relaxed">
            Not ready for a monthly engagement? <a href="/sprint" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">Prove it with The Outbound Sprint</a>, or <a href="/" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">scope a single targeted campaign</a>.
          </p>
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
            <Step n="1" title="The Outbound Sprint" body="A fixed-fee, 6-week proof run: up to 8 experiments against your market, you own everything we build." href="/sprint" />
            <Step n="2" title="We Find What Works" body="The tournament surfaces the winning angle. Losers die fast, the winner gets the volume." />
            <Step n="3" title="Move to a Package" body="Once validated, roll into a monthly package to run the winning playbook at scale, every month." />
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
