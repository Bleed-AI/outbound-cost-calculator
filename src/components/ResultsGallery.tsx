'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { fadeUp, spring, modalBackdrop, modalContent } from '@/lib/motion'

interface CampaignResult {
  title: string
  headline: string
  metrics: { label: string; value: string }[]
  image: string
}

const CAMPAIGNS: CampaignResult[] = [
  {
    title: 'Coaching Offer',
    headline: '241 opportunities from 14,687 sequences — 32% positive reply rate',
    metrics: [
      { label: 'Sequences Started', value: '14,687' },
      { label: 'Reply Rate', value: '5.11%' },
      { label: 'Positive Reply Rate', value: '32.13%' },
      { label: 'Opportunities', value: '241' },
    ],
    image: '/campaign-results/coaching-offer.png',
  },
  {
    title: 'Marketing Agency Offer',
    headline: '16 opportunities at $48K value — 43% positive reply rate',
    metrics: [
      { label: 'Sequences Started', value: '1,572' },
      { label: 'Positive Reply Rate', value: '43.2%' },
      { label: 'Opportunities', value: '16' },
      { label: 'Pipeline Value', value: '$48,000' },
    ],
    image: '/campaign-results/marketing-agency-offer.png',
  },
  {
    title: 'Marketing Agency (Active)',
    headline: '9 warm opportunities in early ramp — campaign still running',
    metrics: [
      { label: 'Sequences Started', value: '2,156' },
      { label: 'Reply Rate', value: '1.35%' },
      { label: 'Positive Reply Rate', value: '31.03%' },
      { label: 'Opportunities', value: '9' },
    ],
    image: '/campaign-results/marketing-agency.png',
  },
  {
    title: 'Recruitment Industry Offer',
    headline: '7 qualified opportunities from 2,525 sequences in 3 months',
    metrics: [
      { label: 'Sequences Started', value: '2,525' },
      { label: 'Reply Rate', value: '1.43%' },
      { label: 'Positive Reply Rate', value: '19.44%' },
      { label: 'Opportunities', value: '7' },
    ],
    image: '/campaign-results/offer-for-recruitment-industry.png',
  },
  {
    title: 'SaaS Signup Trial Offer',
    headline: '42 opportunities at $42K pipeline — 12% reply rate in 10 days',
    metrics: [
      { label: 'Sequences Started', value: '896' },
      { label: 'Reply Rate', value: '12.05%' },
      { label: 'Positive Reply Rate', value: '38.89%' },
      { label: 'Pipeline Value', value: '$42,000' },
    ],
    image: '/campaign-results/saas-signup-trial-offer.png',
  },
  {
    title: 'Tech Setup Offer for Startups',
    headline: '55% of replies were positive — 5 opportunities from 870 sequences',
    metrics: [
      { label: 'Sequences Started', value: '870' },
      { label: 'Reply Rate', value: '1.03%' },
      { label: 'Positive Reply Rate', value: '55.56%' },
      { label: 'Opportunities', value: '5' },
    ],
    image: '/campaign-results/tech-setup-offer-for-startups.png',
  },
  {
    title: 'Paid Events Tickets Offer',
    headline: '102 opportunities at $107K pipeline — 65.8% positive reply rate',
    metrics: [
      { label: 'Sequences Started', value: '17,181' },
      { label: 'Positive Reply Rate', value: '65.8%' },
      { label: 'Opportunities', value: '102' },
      { label: 'Pipeline Value', value: '$107,000' },
    ],
    image: '/campaign-results/paid-events-tickets-offer.png',
  },
]

export function ResultsGallery() {
  const [activeModal, setActiveModal] = useState<CampaignResult | null>(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <>
      <section ref={sectionRef} className="bg-[var(--color-bg)] border-t border-[var(--color-border)] py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
            <p className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-[0.15em]">
              Real Results
            </p>
          </div>
          <h2 className="text-[var(--color-text)] text-2xl font-bold mb-8 tracking-tight">Campaign Results</h2>

          {/* Asymmetric bento grid */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {CAMPAIGNS.map((campaign, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={spring}
                className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                <CampaignCard
                  campaign={campaign}
                  featured={i === 0}
                  onImageClick={() => setActiveModal(campaign)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {activeModal && (
          <ImageModal campaign={activeModal} onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

function CampaignCard({
  campaign,
  featured,
  onImageClick,
}: {
  campaign: CampaignResult
  featured?: boolean
  onImageClick: () => void
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-px hover:border-[var(--color-border-hover)] transition-colors">
      <div className="rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] overflow-hidden flex flex-col h-full">
        {/* Card header */}
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-[var(--color-text)] font-semibold text-sm mb-1">{campaign.title}</h3>
          <p className="text-[var(--color-text-dim)] text-xs leading-relaxed">{campaign.headline}</p>
        </div>

        {/* Metrics grid */}
        <div className={`grid gap-px bg-[var(--color-border)] border-t border-b border-[var(--color-border)] ${
          featured ? 'grid-cols-4' : 'grid-cols-2'
        }`}>
          {campaign.metrics.map((m, i) => (
            <div key={i} className="bg-[var(--color-surface-1)] px-4 py-3">
              <p className="text-[var(--color-brand)] font-black text-lg leading-tight font-[family-name:var(--font-mono)] tabular-nums">
                {m.value}
              </p>
              <p className="text-[var(--color-text-ghost)] text-[10px] mt-0.5 uppercase tracking-wide">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Screenshot */}
        <button
          onClick={onImageClick}
          className="relative flex-1 overflow-hidden group cursor-zoom-in"
          aria-label={`View full screenshot for ${campaign.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={{ maxHeight: featured ? '240px' : '180px' }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              View full screenshot
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function ImageModal({ campaign, onClose }: { campaign: CampaignResult; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={spring}
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-px">
          <div className="rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-[var(--color-text)] font-semibold">{campaign.title}</h3>
                <p className="text-[var(--color-text-dim)] text-xs mt-0.5">{campaign.headline}</p>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors p-1 ml-4 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-px bg-[var(--color-border)] border-b border-[var(--color-border)]">
              {campaign.metrics.map((m, i) => (
                <div key={i} className="bg-[var(--color-surface-1)] px-5 py-4">
                  <p className="text-[var(--color-brand)] font-black text-2xl leading-tight font-[family-name:var(--font-mono)] tabular-nums">{m.value}</p>
                  <p className="text-[var(--color-text-ghost)] text-[10px] mt-1 uppercase tracking-wide">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Full screenshot */}
            <div className="overflow-auto max-h-[60vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={campaign.image} alt={campaign.title} className="w-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
