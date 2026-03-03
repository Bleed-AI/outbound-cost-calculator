import { SectionCard } from '@/components/SectionCard'
import { RadioOption } from '@/components/RadioOption'
import { PRICING } from '@/lib/pricing.config'
import type { DataSource } from '@/lib/types'

interface DataSectionProps {
  value: DataSource
  onChange: (v: DataSource) => void
}

const OPTIONS: {
  value: DataSource
  label: string
  description: string
}[] = [
  {
    value: 'full_list',
    label: 'I will provide the full target list (email validation included)',
    description: 'You supply a complete list of contacts. We validate emails before sending.',
  },
  {
    value: 'full_list_validate',
    label: 'I provide the list — you validate + find missing / invalid emails',
    description:
      'You supply the list; we validate with multiple providers and scrape missing emails from websites.',
  },
  {
    value: 'dfy_scrape',
    label: 'Full DFY — I have targeting criteria, you scrape + validate + enrich',
    description:
      'We source leads from LinkedIn, Apollo, Google Maps, Instagram, then validate and find missing emails with multiple providers.',
  },
  {
    value: 'directory',
    label: 'Data is in a specific directory — scrape, clean & enrich from there',
    description: 'We pull from your specified data directory, clean the data, and enrich it.',
  },
  {
    value: 'live_signal',
    label: 'Data needs to come from a custom live signal-based campaign',
    description:
      'We build and run a signal-based campaign to source highly targeted, real-time leads.',
  },
  {
    value: 'multi_platform',
    label: 'Data is fully scattered — you need to build a custom sourcing system',
    description:
      'Leads are across multiple platforms; we architect and build a custom system to aggregate and clean the data.',
  },
]

export function DataSection({ value, onChange }: DataSectionProps) {
  return (
    <SectionCard
      title="Lead Data Source"
      description="Who will provide (or source) the list of people to target?"
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const rate = PRICING.dataSource[opt.value]
          return (
            <RadioOption
              key={opt.value}
              name="data"
              value={opt.value}
              label={opt.label}
              description={opt.description}
              price={`$${rate}/1k leads`}
              selected={value === opt.value}
              onSelect={() => onChange(opt.value)}
            />
          )
        })}
      </div>
    </SectionCard>
  )
}
