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
    label: 'Client Handles Replies',
    description:
      'BleedAI flags all positive replies and routes them to the client. The client takes conversations and bookings from there.',
    priceDisplay: '$0',
  },
  {
    value: 'ai_instantly',
    label: 'AI Reply Agent (Instantly.ai)',
    description:
      'BleedAI builds an AI agent that handles replies, books calls, and routes leads to your Slack channel and Google Sheet. Includes a human-in-the-loop option.',
    priceDisplay: `$${PRICING.replyHandling.ai_instantly}/1k emails`,
  },
  {
    value: 'custom_n8n',
    label: 'Custom n8n Reply Agent',
    description:
      'BleedAI builds a fully custom n8n workflow with advanced automations, reverse lead magnets, and bespoke actions tailored to your sales process.',
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
