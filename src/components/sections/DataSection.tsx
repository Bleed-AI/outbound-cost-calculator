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
    value: 'dfy_scrape',
    label: 'Full DFY — BleedAI Sources, Scrapes & Validates',
    description:
      'Client provides targeting criteria. BleedAI sources leads from LinkedIn, Apollo, Google Maps, and Instagram, then validates and enriches all emails.',
  },
  {
    value: 'full_list',
    label: 'Client Provides Full Target List',
    description:
      "Client supplies a complete list of contacts. BleedAI validates all emails before sending — no sourcing needed.",
  },
  {
    value: 'full_list_validate',
    label: "Client's List — BleedAI Validates & Recovers Missing Emails",
    description:
      "Client provides the list. BleedAI validates with multiple providers and scrapes missing email addresses from the web.",
  },
  {
    value: 'directory',
    label: 'BleedAI Scrapes From a Specific Directory',
    description:
      "Client specifies a data directory or source. BleedAI pulls, cleans, and enriches all records from it.",
  },
  {
    value: 'live_signal',
    label: 'BleedAI Builds a Custom Live Signal Campaign',
    description:
      'BleedAI builds and runs a signal-based sourcing campaign to generate highly targeted, real-time leads.',
  },
  {
    value: 'multi_platform',
    label: 'BleedAI Builds a Custom Multi-Platform Sourcing System',
    description:
      'Leads are scattered across multiple platforms. BleedAI architects and builds a custom aggregation and cleaning system.',
  },
]

export function DataSection({ value, onChange }: DataSectionProps) {
  return (
    <SectionCard
      title="Lead Data Source"
      description="Who will source and provide the list of people to target?"
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

      {/* Social proof */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/6 px-3 py-2">
        <svg className="w-3.5 h-3.5 text-[#B1130F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-gray-500 text-[11px]">
          Recent campaign: <span className="text-gray-400">241 qualified opportunities</span> from ~15k outreach sequences
        </span>
      </div>
    </SectionCard>
  )
}
