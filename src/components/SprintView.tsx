'use client'

import { useState, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react'
import { motion, LazyMotion, domAnimation } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { InquiryModal, type InquiryContext } from '@/components/InquiryModal'
import { ToolChip, type Tool } from '@/components/ToolStack'

/* ── Secret operator price tier (mirrors the /trials pattern) ── */

type PriceTier = 'high' | 'low'
const TIER_CYCLE: PriceTier[] = ['high', 'low']
const PRICES: Record<PriceTier, number> = { high: 2950, low: 2450 }
const TIER_LABEL: Record<PriceTier, string> = { high: 'standard', low: 'low' }

function isPriceTier(s: string | null): s is PriceTier {
  return s === 'high' || s === 'low'
}

/* ── Card micro-animations ───────────────────────────────
   Each capability card carries one slow, subtle motif (CSS-driven, defined
   in globals.css) so the slide stays alive while it is talked over live. */

function SignalMap() {
  // A grid of buying-signal dots breathing in a staggered wave; a few "hit"
  // in brand red to read as detected signal.
  const hits = new Set([2, 6, 9, 13, 16, 21])
  return (
    <div className="grid grid-cols-7 gap-x-2.5 gap-y-2 w-fit">
      {Array.from({ length: 21 }).map((_, i) => (
        <span
          key={i}
          className={`sprint-dot w-2 h-2 rounded-full ${hits.has(i) ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-text-dim)]'}`}
          style={{ animationDelay: `${(i % 7) * 0.14 + Math.floor(i / 7) * 0.12}s` }}
        />
      ))}
    </div>
  )
}

function TournamentBars() {
  // Four experiments running; one pulls ahead to full width and turns red.
  const rows = [
    { win: false, delay: '0.1s', w: '52%' },
    { win: true, delay: '0s', w: '40%' },
    { win: false, delay: '0.25s', w: '46%' },
    { win: false, delay: '0.4s', w: '58%' },
  ]
  return (
    <div className="flex flex-col gap-2 w-full max-w-[170px]">
      {rows.map((r, i) => (
        <div key={i} className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
          <div
            className={`h-full rounded-full ${r.win ? 'sprint-bar-win bg-[var(--color-brand)]' : 'sprint-bar-lose bg-[var(--color-text-dim)]'}`}
            style={{ width: r.w, animationDelay: r.delay }}
          />
        </div>
      ))}
    </div>
  )
}

function ListRows() {
  // Verified contact rows: always present, each check glows on in sequence so
  // the card never blanks out during a live pitch.
  return (
    <div className="flex flex-col gap-2 w-full max-w-[160px]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="sprint-check w-4 h-4 rounded-full bg-[var(--color-brand)] flex items-center justify-center flex-shrink-0"
            style={{ animationDelay: `${i * 0.6}s` }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="h-2 rounded-full bg-[var(--color-text-dim)]" style={{ width: `${70 - i * 12}%` }} />
        </div>
      ))}
    </div>
  )
}

function TypingCopy() {
  // A reply bubble with the classic typing dots, then a booked slot.
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 rounded-lg rounded-bl-sm bg-[var(--color-surface-2)] px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="sprint-type w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
      <svg className="w-4 h-4 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.3)] px-2.5 py-1.5">
        <svg className="w-3 h-3 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
        </svg>
        <span className="w-6 h-1.5 rounded-full bg-[var(--color-brand)] opacity-60" />
      </div>
    </div>
  )
}

function ReplyPing() {
  // A live inbox ping firing outward from a red core.
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <span className="sprint-ping absolute inset-0 m-auto w-6 h-6 rounded-full border border-[var(--color-brand)]" style={{ animationDelay: '0s' }} />
      <span className="sprint-ping absolute inset-0 m-auto w-6 h-6 rounded-full border border-[var(--color-brand)]" style={{ animationDelay: '1.3s' }} />
      <span className="relative w-3.5 h-3.5 rounded-full bg-[var(--color-brand)]" />
    </div>
  )
}

const CAPABILITIES: { title: string; body: string; canvas: ReactNode }[] = [
  {
    title: 'Your whole market, mapped',
    body: 'Every sourcing method and buying signal that fits you, from 30+ plays and a live signal catalog.',
    canvas: <SignalMap />,
  },
  {
    title: '8 experiments, one tournament',
    body: 'Angles and segments run in parallel. Losers die fast. The winner takes the volume.',
    canvas: <TournamentBars />,
  },
  {
    title: 'Lists nobody else has',
    body: 'ICP and 4-provider email waterfalls, every contact verified. Yours, and they feed your ads too.',
    canvas: <ListRows />,
  },
  {
    title: 'Copy built to get replies',
    body: 'Full strategy, A/B variants, and subsequences that turn positive replies into booked calls.',
    canvas: <TypingCopy />,
  },
  {
    title: 'An AI agent on your inbox',
    body: 'Positive replies answered in minutes and pushed to your calendar, not found next week.',
    canvas: <ReplyPing />,
  },
]

// The 6th card: the tangible inventory the client keeps. Checks glow on in
// sequence. This carries ownership + reinforces the "solve it once" hook.
const OWN_ITEMS: string[] = [
  'Domains + warmed inboxes',
  'Every lead list, from every experiment',
  'Full copy + subsequences',
  'The AI reply agent',
  'All workflows + data',
  'The winning playbook',
]

const TOOLS: Tool[] = [
  { name: 'Clay', logo: 'clay' },
  { name: 'Instantly', logo: 'instantly' },
  { name: 'Prospeo', logo: 'prospeo' },
  { name: 'LinkedIn Sales Nav', logo: 'linkedin' },
  { name: 'Apollo', logo: 'apollo' },
  { name: 'Google Maps', logo: 'googlemaps' },
  { name: 'Niche Directories', glyph: 'directory' },
]

const TIMELINE: { label: string; text: string }[] = [
  { label: 'Week 1', text: 'Build + onboarding' },
  { label: 'Weeks 2-3', text: 'Inbox warmup, experiments queued' },
  { label: 'Weeks 3-6', text: 'Experiments live, weekly readouts' },
  { label: 'Final readout', text: 'Your winning campaign, scaled' },
]

const HOW_STEPS: { n: string; title: string; body: string }[] = [
  { n: '1', title: 'Order + kickoff call', body: 'We finalize scope and write your success bar together, in your numbers.' },
  { n: '2', title: 'We build, you approve', body: 'You sign off the exact lead list and every word of copy before launch.' },
  { n: '3', title: 'The tournament runs', body: 'Up to 8 experiments live, losers killed, weekly readouts you can actually read.' },
  { n: '4', title: 'The decision', body: 'Winner scaled, readout delivered, and if the bar is hit you roll into Growth.' },
]

const BURNED: { title: string; body: string }[] = [
  { title: 'Most agencies bet your whole budget on one guess.', body: 'We assume most angles die. The Sprint is the process that finds the one that does not.' },
  { title: 'You see everything.', body: 'The list, the copy, the live results. Nothing runs without your sign-off.' },
  { title: 'Our incentives are honest.', body: 'The real money for us is the retainer that only starts if your Sprint hits the bar. We need this to work more than you do.' },
  { title: 'The re-run promise.', body: 'If no experiment hits the bar in 6 weeks, we build and run one more round on us. No refund theater, no fine print, one extra round, free.' },
]

const FAQ: { q: string; a: string }[] = [
  { q: 'Why one-time instead of a retainer?', a: 'You should not pay monthly for something unproven. We earn the retainer by proving the system works first.' },
  { q: 'Why not money-back?', a: 'Because some experiments are supposed to fail. The promise that matters is the extra round on us and the assets you keep, either way.' },
  { q: 'What if I already know I want ongoing?', a: 'We will happily start you on Growth. The Sprint is for proving it first.' },
  { q: 'What do you need from me?', a: 'A kickoff call, list and copy approvals, and access to whoever answers meetings.' },
  { q: 'When does it start?', a: 'The invoice clears, your build slot is held, and the warmup clock starts. Inboxes take about 2 weeks to warm, which is why we start now, not later.' },
  { q: 'Who is this NOT for?', a: 'Pre-revenue with no budget, anyone wanting 3-5 hand-picked intros instead of volume, or channels we do not run like paid ads and SEO.' },
]

/* ── View ────────────────────────────────────────────────── */

export function SprintView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialTier: PriceTier = isPriceTier(searchParams.get('p')) ? (searchParams.get('p') as PriceTier) : 'high'
  const [priceTier, setPriceTier] = useState<PriceTier>(initialTier)

  useEffect(() => {
    const newUrl = priceTier === 'high' ? '/sprint' : `/sprint?p=${priceTier}`
    router.replace(newUrl, { scroll: false })
  }, [priceTier, router])

  const cyclePriceTier = useCallback(() => {
    setPriceTier((cur) => {
      const i = TIER_CYCLE.indexOf(cur)
      return TIER_CYCLE[(i + 1) % TIER_CYCLE.length]
    })
  }, [])

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
  const price = PRICES[priceTier]

  const openInquiry = () => setInquiry({
    kind: 'sprint',
    tierLabel: 'The Outbound Sprint',
    priceLabel: `$${price.toLocaleString()} one-time`,
    metadata: { priceTier, price },
  })

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative max-w-6xl mx-auto px-4 pt-4 pb-16">

        {/* Ambient drifting backdrop, barely there. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="sprint-bg-drift absolute -top-10 left-1/4 w-[520px] h-[520px] rounded-full bg-[var(--color-brand)] opacity-[0.06] blur-[120px]" />
        </div>

        {/* HERO SLIDE (must fit one viewport on a screen-share; .sprint-hero
            scales it down on short viewports via globals.css) */}
        <div className="sprint-hero relative">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">

          {/* Pricing card (left ~1/3) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4"
          >
            <PriceCard priceTier={priceTier} price={price} onInquire={openInquiry} />
          </motion.div>

          {/* Capability grid (right ~2/3): 5 animated cards, 3-up then 2-up wider.
              The ownership checklist now lives inside the pricing card. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3"
          >
            {CAPABILITIES.map((c, i) => (
              <CapabilityCard
                key={c.title}
                title={c.title}
                body={c.body}
                canvas={c.canvas}
                span={i < 3 ? 'xl:col-span-2' : 'xl:col-span-3'}
              />
            ))}
          </motion.div>
        </section>

        {/* Tool strip (bottom of hero) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-3 flex items-center gap-3 flex-wrap"
        >
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-ghost)] hidden sm:inline">The GTM stack</span>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t) => <ToolChip key={t.name} tool={t} />)}
          </div>
          <span className="hidden lg:block h-6 w-px bg-[var(--color-border)] mx-1" />
          <span className="text-[12px] text-[var(--color-text-dim)] leading-snug hidden lg:inline">
            We build your pipeline on a best-in-class GTM stack, the same tooling the top outbound teams run on.
          </span>
        </motion.div>
        </div>

        {/* ── BELOW THE FOLD ── */}

        {/* Timeline band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-5 py-4 flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-0"
        >
          {TIMELINE.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 sm:flex-1 min-w-0">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand)]">{step.label}</div>
                <div className="text-xs leading-snug text-[var(--color-text-dim)] mt-0.5">{step.text}</div>
              </div>
              {i < TIMELINE.length - 1 && (
                <svg className="hidden sm:block w-4 h-4 shrink-0 text-[var(--color-text-ghost)] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </motion.div>

        {/* 1. How it works */}
        <Section title="How the Sprint works" className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_STEPS.map((s) => (
              <div key={s.n} className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.3)] text-[var(--color-brand)] text-[11px] font-bold mb-2.5">{s.n}</span>
                <div className="text-[var(--color-text)] font-medium text-sm mb-1">{s.title}</div>
                <p className="text-[var(--color-text-dim)] text-xs leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. The success bar */}
        <Section title="The success bar" className="mt-10">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-muted)] to-[var(--color-surface-1)] px-6 py-6">
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-3xl">
              <span className="text-[var(--color-text)] font-medium">Written before we send a single email.</span>{' '}
              On the kickoff call we define the bar together and translate it into your numbers. Example: 12+ qualified positive replies from your exact target segment. It is measured on the list and the copy you approved, so it means what it says.
            </p>
          </div>
        </Section>

        {/* 3. Been burned before? */}
        <Section title="Been burned before?" className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BURNED.map((b) => (
              <div key={b.title} className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-5 py-4">
                <div className="text-[var(--color-text)] text-sm font-semibold mb-1.5 leading-snug">{b.title}</div>
                <p className="text-[var(--color-text-dim)] text-xs leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. After the Sprint (Growth rollover; price stays off the page, earned on the call) */}
        <Section title="After the Sprint" className="mt-10">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                <span className="text-[var(--color-text)] font-medium">Hit the bar and you can roll into Growth, month to month, no lock-in.</span>{' '}
                You already own the whole system, so this just keeps the winning play running and hunting new markets every month. No pressure to continue, the Sprint stands on its own.
              </p>
              <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mt-2">
                Want something smaller first? You can scope a single one-off campaign to your budget in the <a href="/" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline">calculator</a>.
              </p>
            </div>
            <a
              href="/packages"
              className="shrink-0 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-semibold text-sm inline-flex items-center gap-1 whitespace-nowrap"
            >
              See the monthly plans
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </Section>

        {/* 5. FAQ */}
        <Section title="Questions" className="mt-10">
          <Faq items={FAQ} />
        </Section>
      </div>

      {/* Hidden tier-cycle button (operator-only). */}
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

/* ── Pricing card ────────────────────────────────────────── */

function PriceCard({ priceTier, price, onInquire }: {
  priceTier: PriceTier
  price: number
  onInquire: () => void
}) {
  return (
    <div className="relative h-full rounded-[var(--radius-card)] border border-[rgba(177,19,15,0.4)] bg-gradient-to-br from-[var(--color-brand-muted)] to-[var(--color-surface-1)] p-px overflow-hidden">
      <div className="absolute -top-24 -right-20 w-48 h-48 rounded-full bg-[var(--color-brand)] opacity-[0.08] blur-[80px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative h-full rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] px-5 py-5 flex flex-col">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)] mb-2.5">
          The Outbound Sprint
        </div>

        {/* Price */}
        {priceTier === 'low' ? (
          <div className="flex items-end gap-2 mb-1">
            <span className="text-lg font-bold tabular-nums font-[family-name:var(--font-mono)] text-[var(--color-text-dim)] line-through decoration-[var(--color-brand)] decoration-2 leading-none">
              ${PRICES.high.toLocaleString()}
            </span>
            <motion.span
              key={priceTier}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold tabular-nums font-[family-name:var(--font-mono)] tracking-tight text-[var(--color-text)] leading-none"
            >
              ${price.toLocaleString()}
            </motion.span>
          </div>
        ) : (
          <div className="mb-1">
            <span className="text-4xl font-bold tabular-nums font-[family-name:var(--font-mono)] tracking-tight text-[var(--color-text)] leading-none">
              ${price.toLocaleString()}
            </span>
          </div>
        )}
        <div className="text-[var(--color-text-dim)] text-xs mb-4">one-time</div>

        {/* Power-stat band: the "8 experiments in parallel" is the headline stat. */}
        <div className="grid grid-cols-3 mb-4 rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] divide-x divide-[var(--color-border)] py-2.5">
          <Stat big="8" sub="experiments in parallel" prefix="up to" accent />
          <Stat big="6" sub="weeks, start to scale" />
          <Stat big="30k" sub="emails / mo" prefix="up to" />
        </div>

        <p className="text-[var(--color-text-muted)] text-[13px] leading-relaxed mb-4">
          Everything on the right, built and run end to end. One payment, no retainer to start.
        </p>

        {/* What you keep: value sitting right next to the price. */}
        <div className="mb-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-ghost)] mb-2.5">Yours to keep, either way</div>
          <ul className="flex flex-col gap-1.5">
            {OWN_ITEMS.map((it, i) => (
              <li key={it} className="flex items-center gap-2 text-[12px] leading-tight text-[var(--color-text-muted)]">
                <span
                  className="sprint-check w-4 h-4 rounded-full bg-[var(--color-brand)] flex items-center justify-center flex-shrink-0"
                  style={{ animationDelay: `${i * 0.4}s` } as CSSProperties}
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <button
            onClick={onInquire}
            className="w-full font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-all text-sm bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[#9a0f0c] text-white"
          >
            Start Your Sprint →
          </button>
          <p className="text-[var(--color-text-ghost)] text-[10.5px] leading-relaxed mt-2.5">
            We take on a couple of Sprint builds a week. Your order holds the build slot; the kickoff call finalizes scope.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Capability card (animated) ──────────────────────────── */

function CapabilityCard({ title, body, canvas, span }: { title: string; body: string; canvas: ReactNode; span?: string }) {
  return (
    <div className={`${span ?? ''} rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-4 flex flex-col justify-center transition-colors hover:border-[var(--color-border-hover)]`}>
      <div className="flex items-center min-h-[3.25rem] mb-3">
        {canvas}
      </div>
      <div className="text-[var(--color-text)] text-[15px] font-semibold leading-snug mb-1">{title}</div>
      <p className="text-[var(--color-text-dim)] text-[12.5px] leading-relaxed">{body}</p>
    </div>
  )
}

/* ── Stat (the highlighted power-stat band in the price card) ─── */

function Stat({ big, sub, prefix, accent }: { big: string; sub: string; prefix?: string; accent?: boolean }) {
  return (
    <div className="text-center px-1">
      <div className="text-[8px] uppercase tracking-wide text-[var(--color-text-ghost)] leading-none mb-1 h-2">{prefix ?? ''}</div>
      <div className={`text-[26px] font-bold tabular-nums font-[family-name:var(--font-mono)] leading-none ${accent ? 'text-[var(--color-brand)]' : 'text-[var(--color-text)]'}`}>{big}</div>
      <div className="text-[9.5px] text-[var(--color-text-dim)] leading-tight mt-1.5">{sub}</div>
    </div>
  )
}

/* ── Section wrapper ─────────────────────────────────────── */

function Section({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
        <h2 className="text-[var(--color-text)] font-medium text-sm tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}

/* ── FAQ accordion ───────────────────────────────────────── */

function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] divide-y divide-[var(--color-border)] overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
            >
              <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'}`}>
                {item.q}
              </span>
              <svg
                className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-dim)] transition-transform ${isOpen ? 'rotate-180 text-[var(--color-brand)]' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="px-5 pb-4 -mt-1 text-[var(--color-text-dim)] text-[13px] leading-relaxed"
              >
                {item.a}
              </motion.p>
            )}
          </div>
        )
      })}
    </div>
  )
}
