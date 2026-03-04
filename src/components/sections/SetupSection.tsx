import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import type { SetupOption } from '@/lib/types'

interface SetupSectionProps {
  value: SetupOption
  onChange: (v: SetupOption) => void
}

const OPTIONS: { value: SetupOption; label: string; description: string; price: string; priceNote: string }[] = [
  {
    value: 'none',
    label: 'No setup help needed',
    description: "I don't need to build custom infrastructure.",
    price: '$0',
    priceNote: '',
  },
  {
    value: 'full_dfy',
    label: 'Full DFY Instantly System Setup',
    description:
      'BleedAI builds your complete Instantly.ai setup: branded domains and inboxes, DKIM/SPF/DMARC configuration, profile names, photos, signatures, account warm-up, and SOPs for running the system.',
    price: '$400',
    priceNote: 'one-time',
  },
  {
    value: 'branded_only',
    label: 'Branded Domains & Inboxes Only',
    description:
      'BleedAI creates your branded domains and inboxes with full DKIM/SPF/DMARC, profile names, photos, and signatures. Infrastructure is ready to use — Instantly.ai integration not included.',
    price: '$250',
    priceNote: 'one-time',
  },
]

export function SetupSection({ value, onChange }: SetupSectionProps) {
  return (
    <SectionCard
      title="Infrastructure Setup"
      description="Does BleedAI need to build your sending infrastructure, or do you already have it?"
      optional
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <RadioOption
            key={opt.value}
            name="setup"
            value={opt.value}
            label={opt.label}
            description={opt.description}
            price={opt.price}
            priceNote={opt.priceNote}
            selected={value === opt.value}
            onSelect={() => onChange(opt.value)}
          />
        ))}
      </div>
    </SectionCard>
  )
}
