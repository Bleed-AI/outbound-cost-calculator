import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { SupportTier } from '@/lib/types'

interface SupportSectionProps {
  value: SupportTier
  baseTotal: number
  onChange: (v: SupportTier) => void
}

const OPTIONS: {
  value: SupportTier
  label: string
  description: string
  threshold: number
}[] = [
  {
    value: 'email',
    label: 'Light Email / Upwork Support',
    description: 'Async support via email or Upwork throughout the campaign duration.',
    threshold: PRICING.supportWaiverThresholds.email,
  },
  {
    value: 'slack_light',
    label: 'Light Slack Support',
    description: 'Dedicated Slack channel with responsive support during the campaign.',
    threshold: PRICING.supportWaiverThresholds.slack_light,
  },
  {
    value: 'slack_full',
    label: 'Full Slack + Calls on Demand',
    description: '5 days/week Slack support plus calls whenever needed. Full white-glove experience.',
    threshold: PRICING.supportWaiverThresholds.slack_full,
  },
]

export function SupportSection({ value, baseTotal, onChange }: SupportSectionProps) {
  // Find the best unlock nudge: the cheapest support tier the user hasn't yet unlocked
  const bestNudge = OPTIONS.find((opt) => {
    const remaining = opt.threshold - baseTotal
    return remaining > 0 && remaining <= opt.threshold * 0.3
  })

  return (
    <SectionCard
      title="Support"
      description="What level of ongoing support do you need during the campaign?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const price = PRICING.support[opt.value]
          const isFree = baseTotal >= opt.threshold
          return (
            <RadioOption
              key={opt.value}
              name="support"
              value={opt.value}
              label={opt.label}
              description={
                isFree
                  ? `${opt.description} — included in packages over $${opt.threshold.toLocaleString()}`
                  : `${opt.description} — free for packages over $${opt.threshold.toLocaleString()}`
              }
              price={isFree ? '$0' : `$${price}`}
              priceNote={isFree ? 'included' : 'per campaign'}
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
              strikePrice={isFree ? `$${price}` : undefined}
            />
          )
        })}
      </div>

      {/* Unlock nudge */}
      {bestNudge && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/15 px-3 py-2">
          <svg className="w-3.5 h-3.5 text-green-500/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-green-400/80 text-xs">
            ${Math.ceil(bestNudge.threshold - baseTotal).toLocaleString()} more to unlock free {bestNudge.label.toLowerCase()}
          </span>
        </div>
      )}
    </SectionCard>
  )
}
