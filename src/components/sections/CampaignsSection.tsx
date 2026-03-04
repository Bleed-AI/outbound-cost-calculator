import { SectionCard } from '@/components/SectionCard'
import { CAMPAIGNS_OPTIONS, includedCampaignTier } from '@/lib/pricing'
import { PRICING } from '@/lib/pricing.config'
import type { CampaignsCount, LeadsPerMonth } from '@/lib/types'

interface CampaignsSectionProps {
  value: CampaignsCount
  leads: LeadsPerMonth
  onChange: (v: CampaignsCount) => void
}

export function CampaignsSection({ value, leads, onChange }: CampaignsSectionProps) {
  const includedTier = includedCampaignTier(leads)

  return (
    <SectionCard
      title="Campaign Strategy"
      description="How many parallel campaign strategies should BleedAI run? Each strategy can target a different ICP or test a different angle — your total lead volume is split between them."
    >
      <div className="flex gap-2 mb-4">
        {CAMPAIGNS_OPTIONS.map((count) => {
          const isIncluded = count <= includedTier
          const fullPrice = PRICING.campaigns[count]
          const includedBasePrice = PRICING.campaigns[includedTier]
          const effectivePrice = count > includedTier ? fullPrice - includedBasePrice : 0
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
              <div className="font-semibold text-sm">
                {count} {count === 1 ? 'Strategy' : 'Strategies'}
              </div>
              <div className="text-xs mt-0.5">
                {isIncluded ? (
                  <span className="text-green-400 font-semibold">Included</span>
                ) : effectivePrice === 0 ? (
                  <span className={isSelected ? 'text-[#e84040]' : 'text-gray-600'}>Included</span>
                ) : (
                  <span className={isSelected ? 'text-[#e84040]' : 'text-gray-600'}>
                    +${effectivePrice}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {includedTier > 1 && (
        <div className="bg-green-500/8 border border-green-500/20 rounded-lg px-4 py-3 flex gap-3 mb-4">
          <div className="text-green-400 mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            <span className="text-white font-medium">
              {includedTier === 3 ? '3' : '2'} campaign {includedTier === 3 ? 'strategies are' : 'strategies are'} included
            </span>{' '}
            at your selected lead volume — no additional charge.
          </p>
        </div>
      )}

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
          If your offer is new or competes in a crowded market, multiple strategies typically yield far better results — each can target a different ICP or test a completely different messaging angle.
        </p>
      </div>
    </SectionCard>
  )
}
