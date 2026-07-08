'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
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

/* ── Content ─────────────────────────────────────────────── */

const CREDIT_LINES: string[] = [
  '$500 of your Sprint fee credits toward Growth month 1',
  'Optional: your own Instantly.ai account, set up under your ownership (+$200)',
]

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'Your whole outbound surface, mapped.',
    body: 'Every sourcing method and buying signal relevant to your TAM. We maintain 30+ list-building methods and a live signal catalog; your Sprint starts by picking the ones with real coverage for you.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
  },
  {
    title: 'Up to 8 experiments, run as a tournament.',
    body: 'Different segments, angles and signals in parallel. Losers die fast. The winner gets the volume.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h2a2 2 0 010 4h-.5M7 5H5a2 2 0 000 4h.5" />,
  },
  {
    title: 'Lists nobody else has.',
    body: 'ICP waterfalls across providers for maximum coverage, a 4-provider email waterfall, every contact verified before a single send. The lists are yours, and they work for your ads too.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3zM4 7v5c0 1.657 3.582 3 8 3s8-1.343 8-3V7M4 12v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5" />,
  },
  {
    title: 'Copy built for replies, then meetings.',
    body: 'Full copy strategy with A/B variants, plus subsequences that push positive replies to a booked call instead of letting them go cold.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-13.5 7.8L3 21l1.2-4.5A9 9 0 1121 12z" />,
  },
  {
    title: 'An AI reply agent working your inbox.',
    body: 'Positive replies get answered in minutes and steered to your calendar, not discovered next Tuesday.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />,
  },
  {
    title: 'You own the machine.',
    body: 'Domains, inboxes, workflows, lists, copy, data. When the Sprint ends, the system stays with you.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
  },
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

const KEEP: { title: string; note: string }[] = [
  { title: 'Sending infrastructure', note: 'Domains and inboxes, yours.' },
  { title: 'Every lead list from every experiment', note: 'Ads-ready, and they work for your ads too.' },
  { title: 'Full copy strategy + subsequences', note: 'The angles, variants and follow-ups that ran.' },
  { title: 'The AI reply agent', note: 'Steering positive replies to your calendar.' },
  { title: 'The tournament readout', note: 'What won, what died, and why.' },
  { title: 'Optional: your own Instantly account', note: 'Set up under your ownership (+$200).' },
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
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-16">

        {/* HERO SLIDE (must fit one viewport on a screen-share) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">

          {/* Pricing card (left ~1/3) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-1"
          >
            <PriceCard priceTier={priceTier} price={price} onInquire={openInquiry} />
          </motion.div>

          {/* Feature grid (right ~2/3) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
          >
            {FEATURES.map((f) => (
              <FeatureTile key={f.title} title={f.title} body={f.body} icon={f.icon} />
            ))}
          </motion.div>
        </section>

        {/* Tool strip + mini timeline (bottom of hero) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-3.5 flex flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-6"
        >
          {/* Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-ghost)] hidden sm:inline">Your stack</span>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map((t) => <ToolChip key={t.name} tool={t} />)}
            </div>
          </div>

          <span className="hidden lg:block h-8 w-px bg-[var(--color-border)]" />

          {/* Timeline */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-0">
            {TIMELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:flex-1 min-w-0">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand)]">{step.label}</div>
                  <div className="text-[11px] leading-snug text-[var(--color-text-dim)]">{step.text}</div>
                </div>
                {i < TIMELINE.length - 1 && (
                  <svg className="hidden sm:block w-3.5 h-3.5 shrink-0 text-[var(--color-text-ghost)] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── BELOW THE FOLD ── */}

        {/* 1. How it works */}
        <Section title="How the Sprint works" className="mt-14">
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

        {/* 2. What you keep */}
        <Section title="What you keep, either way" className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {KEEP.map((k) => (
              <div key={k.title} className="flex gap-2.5 rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3.5">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="text-[var(--color-text)] text-sm font-medium leading-snug">{k.title}</div>
                  <div className="text-[var(--color-text-dim)] text-xs mt-0.5 leading-relaxed">{k.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. The success bar */}
        <Section title="The success bar" className="mt-10">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-muted)] to-[var(--color-surface-1)] px-6 py-6">
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-3xl">
              <span className="text-[var(--color-text)] font-medium">Written before we send a single email.</span>{' '}
              On the kickoff call we define the bar together and translate it into your numbers. Example: 12+ qualified positive replies from your exact target segment. It is measured on the list and the copy you approved, so it means what it says.
            </p>
          </div>
        </Section>

        {/* 4. Been burned before? */}
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

        {/* 5. After the Sprint */}
        <Section title="After the Sprint" className="mt-10">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                <span className="text-[var(--color-text)] font-medium">Growth, $2,450/mo, month to month, no lock-in.</span>{' '}
                You already own the system, and $500 of your Sprint fee credits toward month 1.
              </p>
              <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mt-2">
                Prefer to spread the cost? Our monthly Pilot plan runs the winning play at $1,500/mo.
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

        {/* 6. FAQ */}
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
        <div className="text-[var(--color-text-dim)] text-xs mb-3">one-time</div>

        <p className="text-[var(--color-text-ghost)] text-[11px] leading-relaxed mb-3">
          6 weeks · up to 8 campaign experiments · sized to your market (up to 20k emails/mo capacity)
        </p>

        <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">
          If an experiment hits the bar we write together, you roll into Growth at $2,450/mo, month to month. If nothing hits, we run another round on us. Either way, everything we build is yours.
        </p>

        <ul className="space-y-2 mb-4">
          {CREDIT_LINES.map((line) => (
            <li key={line} className="flex gap-2 text-[11.5px] leading-relaxed text-[var(--color-text-muted)]">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <button
            onClick={onInquire}
            className="w-full font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-all text-sm bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[#9a0f0c] text-white"
          >
            Start Your Sprint →
          </button>
          <p className="text-[var(--color-text-ghost)] text-[10.5px] leading-relaxed mt-2.5">
            We take on a couple of Sprint builds per week. The order form holds your build slot; the kickoff call finalizes scope.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Feature tile ────────────────────────────────────────── */

function FeatureTile({ title, body, icon }: { title: string; body: string; icon: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3.5 py-3.5 flex flex-col transition-colors hover:border-[var(--color-border-hover)]">
      <div className="flex items-center justify-center w-8 h-8 rounded-[9px] bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.25)] mb-2.5">
        <svg className="w-4 h-4 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className="text-[var(--color-text)] text-[13px] font-semibold leading-snug mb-1">{title}</div>
      <p className="text-[var(--color-text-dim)] text-[11px] leading-relaxed">{body}</p>
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
