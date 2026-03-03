import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { InboxOwnership } from '@/lib/types'

interface InboxSectionProps {
  value: InboxOwnership
  onChange: (v: InboxOwnership) => void
}

const OPTIONS: {
  value: InboxOwnership
  label: string
  description: string
}[] = [
  {
    value: 'user_domains',
    label: 'I will provide my branded domains & inboxes',
    description: 'Deliverability is solid. You manage your own infrastructure.',
  },
  {
    value: 'user_domains_instantly',
    label: 'I will provide my branded domains, inboxes + Instantly.ai account',
    description: 'You own everything; we use your Instantly.ai seat to run campaigns.',
  },
  {
    value: 'dfy',
    label: 'DFY — Use your warm domains, inboxes & infrastructure',
    description:
      'We handle all infrastructure. Best for those who want zero operational overhead.',
  },
]

export function InboxSection({ value, onChange }: InboxSectionProps) {
  return (
    <SectionCard
      title="Inbox & Infrastructure Ownership"
      description="Who owns the sending domains, inboxes, and Instantly.ai account?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const rate = PRICING.inboxOwnership[opt.value]
          return (
            <RadioOption
              key={opt.value}
              name="inbox"
              value={opt.value}
              label={opt.label}
              description={opt.description}
              price={`$${rate}/1k emails`}
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}
