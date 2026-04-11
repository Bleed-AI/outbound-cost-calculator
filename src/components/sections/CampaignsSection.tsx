import { SectionCard } from '@/components/SectionCard'
import { CopywritingIllustration } from '@/components/SectionIllustrations'
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
      illustration={<CopywritingIllustration />}
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
              suppressHydrationWarning
              className={`flex-1 py-3 rounded-[var(--radius-inner)] border text-center transition-all ${
                isSelected
                  ? 'border-[var(--color-border-active)] bg-[var(--color-brand-muted)] text-[var(--color-text)]'
                  : 'border-[var(--color-border-hover)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="font-semibold text-sm">
                {count} {count === 1 ? 'Strategy' : 'Strategies'}
              </div>
              <div className="text-xs mt-0.5">
                {isIncluded ? (
                  <span className="text-[var(--color-success)] font-semibold">Included</span>
                ) : effectivePrice === 0 ? (
                  <span className={isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-ghost)]'}>Included</span>
                ) : (
                  <span className={isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-ghost)]'}>
                    +${effectivePrice}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {includedTier > 1 && (
        <div className="bg-[var(--color-success-bg)] border border-[rgba(52,211,153,0.15)] rounded-[var(--radius-inner)] px-4 py-3 flex gap-3 mb-4">
          <div className="text-[var(--color-success)] mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
            <span className="text-[var(--color-text)] font-medium">
              {includedTier === 3 ? '3' : '2'} campaign {includedTier === 3 ? 'strategies are' : 'strategies are'} included
            </span>{' '}
            at your selected lead volume — no additional charge.
          </p>
        </div>
      )}

      {/* Tip callout */}
      <div className="bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.2)] rounded-[var(--radius-inner)] px-4 py-3 flex gap-3">
        <div className="text-[var(--color-brand)] mt-0.5 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a2 2 0 01-1.414.587H9.657a2 2 0 01-1.414-.587l-.347-.347z"
            />
          </svg>
        </div>
        <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
          <span className="text-[var(--color-text)] font-medium">Tip: </span>
          If your offer is new or competes in a crowded market, multiple strategies typically yield far better results — each can target a different ICP or test a completely different messaging angle.
        </p>
      </div>
    </SectionCard>
  )
}
