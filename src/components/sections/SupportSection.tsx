import { SectionCard } from '@/components/SectionCard'
import { SupportIllustration } from '@/components/SectionIllustrations'
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
  badge?: string
}[] = [
  {
    value: 'email',
    label: 'Email Support',
    description:
      'Minimal async email support for status updates. Best only if you don\'t plan to iterate — if you want ongoing adjustments throughout the campaign, pick a Slack tier instead.',
  },
  {
    value: 'slack_light',
    label: 'Standard Slack Support',
    description:
      'Dedicated Slack channel with same-day responses during the campaign. Request optimisations as often as you want. No scheduled calls included — all async over Slack.',
    badge: 'Recommended',
  },
  {
    value: 'slack_full',
    label: 'Full Slack + Calls',
    description:
      '5 days/week Slack support with priority responses, plus scheduled and on-demand calls whenever you need them. Full white-glove experience for clients who want tight collaboration and rapid iteration.',
  },
]

export function SupportSection({ value, onChange }: SupportSectionProps) {
  return (
    <SectionCard
      title="Support"
      description="What level of ongoing support do you need during the campaign?"
      illustration={<SupportIllustration />}
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
              description={opt.description}
              price={`$${price}`}
              priceNote="per month"
              badge={opt.badge}
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}
