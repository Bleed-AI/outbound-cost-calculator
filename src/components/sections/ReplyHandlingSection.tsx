import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { ReplyHandling } from '@/lib/types'

interface ReplyHandlingSectionProps {
  value: ReplyHandling
  onChange: (v: ReplyHandling) => void
}

const OPTIONS: {
  value: ReplyHandling
  label: string
  description: string
  priceDisplay: string
  priceNote?: string
}[] = [
  {
    value: 'none',
    label: 'Forward positive replies — I will handle communications',
    description: "We flag positive replies and route them to you. You take it from there.",
    priceDisplay: '$0',
  },
  {
    value: 'ai_instantly',
    label: 'Build an AI reply agent in Instantly.ai',
    description:
      'AI handles replies, books calls, routes them to a Google Sheet and Slack. Includes a human-in-the-loop option.',
    priceDisplay: `$${PRICING.replyHandling.ai_instantly}/1k emails`,
  },
  {
    value: 'custom_n8n',
    label: 'Custom n8n reply agent with advanced automations',
    description:
      'Highly custom n8n workflow to create reverse lead magnets or take bespoke actions when replying to leads.',
    priceDisplay: `$${PRICING.replyHandling.custom_n8n}/1k emails`,
    priceNote: `+ $${PRICING.replyHandling.n8n_setup} one-time build fee`,
  },
]

export function ReplyHandlingSection({ value, onChange }: ReplyHandlingSectionProps) {
  return (
    <SectionCard
      title="Reply Handling & Booking"
      description="How should positive replies and meeting bookings be managed?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <RadioOption
            key={opt.value}
            name="reply"
            value={opt.value}
            label={opt.label}
            description={opt.description}
            price={opt.priceDisplay}
            priceNote={opt.priceNote}
            selected={value === opt.value}
            onSelect={() => onChange(opt.value)}
          />
        ))}
      </div>
    </SectionCard>
  )
}
