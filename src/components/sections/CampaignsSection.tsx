import { SectionCard } from '@/components/SectionCard'
import { CAMPAIGNS_OPTIONS } from '@/lib/pricing'
import { PRICING } from '@/lib/pricing.config'
import type { CampaignsCount } from '@/lib/types'

interface CampaignsSectionProps {
  value: CampaignsCount
  onChange: (v: CampaignsCount) => void
}

export function CampaignsSection({ value, onChange }: CampaignsSectionProps) {
  return (
    <SectionCard
      title="Number of Campaigns"
      description="How many parallel campaigns do you want to run?"
    >
      <div className="flex gap-2 mb-4">
        {CAMPAIGNS_OPTIONS.map((count) => {
          const price = PRICING.campaigns[count]
          const isSelected = value === count
          return (
            <button
              key={count}
              onClick={() => onChange(count)}
              className={`flex-1 py-3 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'border-[#B1130F] bg-[#B1130F]/10 text-white'
                  : 'border-white/10 bg-[#050508] text-gray-400 hover:border-white/20 hover:text-gray-200'
              }`}
            >
              <div className="font-semibold text-sm">{count} Campaign{count > 1 ? 's' : ''}</div>
              <div
                className={`text-xs mt-0.5 ${isSelected ? 'text-[#e84040]' : 'text-gray-600'}`}
              >
                {price === 0 ? 'Included' : `+$${price}`}
              </div>
            </button>
          )
        })}
      </div>

      {/* Tip callout */}
      <div className="bg-[#B1130F]/8 border border-[#B1130F]/20 rounded-lg px-4 py-3 flex gap-3">
        <div className="text-[#B1130F] mt-0.5 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a2 2 0 01-1.414.587H9.657a2 2 0 01-1.414-.587l-.347-.347z"
            />
          </svg>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          <span className="text-white font-medium">Tip: </span>
          If your offer is generic with many competitors, or if your offer is brand new, multiple
          campaigns typically yield far better results. Each campaign can target a different ICP or
          test a different strategy — your total lead volume is split between them.
        </p>
      </div>
    </SectionCard>
  )
}
