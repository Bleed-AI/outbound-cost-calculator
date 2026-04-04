import { SectionCard } from '@/components/SectionCard'
import { EnrichmentsIllustration } from '@/components/SectionIllustrations'
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
    description: 'Data is already clean and complete — no extra enrichment required.',
  },
  {
    value: 'standard',
    label: 'Standard Enrichments',
    description:
      'BleedAI enriches leads with website data, generates AI-driven personalisation snippets, and applies standard Clay enrichments.',
  },
  {
    value: 'advanced',
    label: 'Advanced Signal-Based or Custom Clay Enrichments',
    description:
      'BleedAI builds complex enrichment workflows using live signals, custom Clay tables, or other advanced data sources.',
  },
]

export function EnrichmentsSection({ value, onChange }: EnrichmentsSectionProps) {
  return (
    <SectionCard
      title="Additional Enrichments"
      description="Does the lead data need enrichment before the campaign can launch?"
      illustration={<EnrichmentsIllustration />}
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
