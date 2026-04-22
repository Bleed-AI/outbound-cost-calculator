import { SectionCard } from '@/components/SectionCard'
import { ReplyHandlingIllustration } from '@/components/SectionIllustrations'
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
  badge?: string
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
    label: 'AI Reply Agent',
    description:
      'A 24/7 AI agent (powered by Instantly.ai) that replies instantly, qualifies leads, books calls on your calendar, and pipes every hot conversation straight to your Slack and Google Sheet. We start human-in-the-loop so every reply is reviewed — then transition to fully autonomous once your voice is locked in. Saves hours of reply management every week and ensures no lead goes cold.',
    priceDisplay: `$${PRICING.replyHandling.ai_instantly}/1k emails`,
    badge: 'Recommended',
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
      illustration={<ReplyHandlingIllustration />}
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
            badge={opt.badge}
            selected={value === opt.value}
            onSelect={() => onChange(opt.value)}
          />
        ))}
      </div>
    </SectionCard>
  )
}
