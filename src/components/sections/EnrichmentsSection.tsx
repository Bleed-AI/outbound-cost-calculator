import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { Enrichments } from '@/lib/types'

interface EnrichmentsSectionProps {
  value: Enrichments
  onChange: (v: Enrichments) => void
}

const OPTIONS: {
  value: Enrichments
  label: string
  description: string
}[] = [
  {
    value: 'none',
    label: 'No additional enrichments needed',
    description: 'My data is clean and complete — no extra enrichment required.',
  },
  {
    value: 'standard',
    label: 'Standard enrichments — website, AI personalisation & others',
    description:
      'We enrich leads with website data, generate AI-driven personalisation snippets, and apply other standard Clay enrichments.',
  },
  {
    value: 'advanced',
    label: 'Advanced signal-based or custom Clay enrichments',
    description:
      'Complex enrichment workflows using live signals, custom Clay tables, or other advanced data sources.',
  },
]

export function EnrichmentsSection({ value, onChange }: EnrichmentsSectionProps) {
  return (
    <SectionCard
      title="Additional Enrichments"
      description="Does your lead data need enrichment before the campaign can launch?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const rate = PRICING.enrichments[opt.value]
          return (
            <RadioOption
              key={opt.value}
              name="enrichments"
              value={opt.value}
              label={opt.label}
              description={opt.description}
              price={rate === 0 ? '$0' : `$${rate}/1k leads`}
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}
