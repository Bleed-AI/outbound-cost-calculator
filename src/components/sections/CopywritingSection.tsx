import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { CopywritingOption } from '@/lib/types'

interface CopywritingSectionProps {
  value: CopywritingOption
  onChange: (v: CopywritingOption) => void
}

const OPTIONS: {
  value: CopywritingOption
  label: string
  description: string
}[] = [
  {
    value: 'full_strategy',
    label: 'Build my strategy from scratch + A/B test variants',
    description:
      'BleedAI researches your ICP, crafts the optimal copy and personalisation angles for your specific offer, and runs A/B tests across multiple approaches to find the highest-performing variant.',
  },
  {
    value: 'finalized',
    label: 'I have a finalised strategy — optimise for deliverability only',
    description:
      'Your messaging is already defined. BleedAI reviews and optimises all copy for maximum deliverability and response rates.',
  },
]

export function CopywritingSection({ value, onChange }: CopywritingSectionProps) {
  return (
    <SectionCard
      title="Copywriting Strategy"
      description="Do you have a finalised messaging strategy, or should BleedAI build it from scratch?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const price = PRICING.copywriting[opt.value]
          return (
            <RadioOption
              key={opt.value}
              name="copywriting"
              value={opt.value}
              label={opt.label}
              description={opt.description}
              price={`$${price}`}
              priceNote="one-time"
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}
