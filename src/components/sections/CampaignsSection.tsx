import { SectionCard } from '@/components/SectionCard'
import { CopywritingIllustration } from '@/components/SectionIllustrations'
import { CAMPAIGNS_OPTIONS } from '@/lib/pricing'
import { PRICING } from '@/lib/pricing.config'
import type { CampaignsCount, LeadsPerMonth } from '@/lib/types'

interface CampaignsSectionProps {
  value: CampaignsCount
  leads: LeadsPerMonth
  onChange: (v: CampaignsCount) => void
}

export function CampaignsSection({ value, onChange }: CampaignsSectionProps) {
  return (
    <SectionCard
      title="Campaign Experiments"
      description="How many distinct campaign experiments should we run for you? The first is included. Each additional experiment tests a different ICP, offer angle, or messaging hook — and meaningfully increases the chance of finding what works."
      illustration={<CopywritingIllustration />}
    >
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {CAMPAIGNS_OPTIONS.map((count) => {
          const isFirst = count === 1
          const effectivePrice = isFirst ? 0 : PRICING.campaigns[count]
          const isSelected = value === count
          return (
            <button
              key={count}
              onClick={() => onChange(count)}
              suppressHydrationWarning
              className={`py-3 rounded-[var(--radius-inner)] border text-center transition-all ${
                isSelected
                  ? 'border-[var(--color-border-active)] bg-[var(--color-brand-muted)] text-[var(--color-text)]'
                  : 'border-[var(--color-border-hover)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="font-semibold text-sm">{count}</div>
              <div className="text-[10px] mt-0.5">
                {isFirst ? (
                  <span className="text-[var(--color-success)] font-semibold">Included</span>
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
          Running multiple parallel experiments dramatically improves your odds of finding a winning campaign — each tests a different angle so you learn fast.
        </p>
      </div>
    </SectionCard>
  )
}
