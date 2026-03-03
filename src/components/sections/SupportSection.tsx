import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { SupportTier } from '@/lib/types'

interface SupportSectionProps {
  value: SupportTier
  onChange: (v: SupportTier) => void
}

const OPTIONS: {
  value: SupportTier
  label: string
  description: string
  freeNote: string
}[] = [
  {
    value: 'email',
    label: 'Light Email / Upwork Support',
    description: 'Async support via email or Upwork throughout the campaign duration.',
    freeNote: 'Free for first-time clients & packages ≥ $500/mo',
  },
  {
    value: 'slack_light',
    label: 'Light Slack Support',
    description: 'Dedicated Slack channel with responsive support during campaign.',
    freeNote: 'Free for packages ≥ $1,000/mo',
  },
  {
    value: 'slack_full',
    label: 'Full Slack Support + Calls on Demand',
    description: '5 days/week Slack support plus calls whenever needed. Full white-glove experience.',
    freeNote: 'Free for packages ≥ $2,000/mo',
  },
]

export function SupportSection({ value, onChange }: SupportSectionProps) {
  return (
    <SectionCard
      title="Support"
      description="What level of ongoing support do you need during the campaign?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const price = PRICING.support[opt.value]
          return (
            <RadioOption
              key={opt.value}
              name="support"
              value={opt.value}
              label={opt.label}
              description={`${opt.description} — ${opt.freeNote}`}
              price={`$${price}`}
              priceNote="per campaign"
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}
