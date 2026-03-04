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
    value: 'dfy',
    label: "BleedAI's Warm Infrastructure (DFY)",
    description:
      "BleedAI provides all sending domains, inboxes, and infrastructure. Zero operational overhead — best for clients who want us to own and manage everything.",
  },
  {
    value: 'user_domains',
    label: "Client's Branded Domains & Inboxes",
    description:
      "Client provides their own branded domains and inboxes. BleedAI manages campaigns on the client's infrastructure.",
  },
  {
    value: 'user_domains_instantly',
    label: "Client's Domains, Inboxes + Instantly.ai Account",
    description:
      "Client provides the full infrastructure including a dedicated Instantly.ai seat. BleedAI operates the client's account to run campaigns.",
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
