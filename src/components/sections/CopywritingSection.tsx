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
    value: 'finalized',
    label: 'I have a finalised copywriting strategy',
    description:
      'Your messaging is ready. We still review and optimise all copy for maximum deliverability and response rates.',
  },
  {
    value: 'full_strategy',
    label: 'Build my strategy from scratch + run A/B tests',
    description:
      'We research your ICP, craft the best copy and personalisation angles for your specific case, and A/B test multiple approaches to find the highest-performing variant.',
  },
]

export function CopywritingSection({ value, onChange }: CopywritingSectionProps) {
  return (
    <SectionCard
      title="Copywriting Strategy"
      description="Do you have a finalised messaging strategy, or do you need us to build it?"
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
