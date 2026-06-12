import { SectionCard } from '@/components/SectionCard'
import { SupportIllustration } from '@/components/SectionIllustrations'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { SupportTier } from '@/lib/types'

interface SupportSectionProps {
  value: SupportTier
  onChange: (v: SupportTier) => void
}

// Every campaign includes a dedicated Slack channel — email-only support was
// retired (it signalled a no-touch engagement). The choice is now how much
// access, not whether you get Slack.
const OPTIONS: {
  value: SupportTier
  label: string
  description: string
  badge?: string
}[] = [
  {
    value: 'slack_light',
    label: 'Standard Slack Support',
    description:
      'Dedicated Slack channel with same-day responses throughout the campaign. Request optimisations as often as you want — all async over Slack.',
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
      description="Every campaign includes a dedicated Slack channel. How much access do you want?"
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
