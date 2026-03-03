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
    description: 'I already have my infrastructure ready to go.',
    price: '$0',
    priceNote: '',
  },
  {
    value: 'full_dfy',
    label: 'Full DFY Instantly System Setup',
    description:
      'We build your Instantly.ai setup: create branded domains/inboxes, configure DKIM, SPF, DMARC, profile names, photos, signatures, integrate on Instantly, warm up all new accounts, and provide SOPs on running the system.',
    price: '$400',
    priceNote: 'one-time',
  },
  {
    value: 'branded_only',
    label: 'Branded Domains & Inboxes Only',
    description:
      'We create your branded domains and inboxes, configure DKIM, SPF, DMARC, profile names, photos, and signatures. Infrastructure is ready to use.',
    price: '$250',
    priceNote: 'one-time',
  },
]

export function SetupSection({ value, onChange }: SetupSectionProps) {
  return (
    <SectionCard
      title="Infrastructure Setup"
      description="Do you need help setting up your sending infrastructure?"
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
