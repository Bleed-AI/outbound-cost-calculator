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
    </SectionCard>
  )
}
