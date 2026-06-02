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
      description="How many distinct campaign experiments should we run for you? Each tests a different ICP, offer angle, or messaging hook — meaningfully increases the chance of finding what actually works."
      illustration={<CopywritingIllustration />}
    >
      {/* Larger experiment buttons — 5 across with proper hit-target + visible price */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {CAMPAIGNS_OPTIONS.map((count) => {
          const isFirst = count === 1
          const effectivePrice = isFirst ? 0 : PRICING.campaigns[count]
          const isSelected = value === count
          return (
            <button
              key={count}
              onClick={() => onChange(count)}
              suppressHydrationWarning
              className={`group relative py-5 rounded-[var(--radius-inner)] border text-center transition-all overflow-hidden ${
                isSelected
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] text-[var(--color-text)] shadow-[0_0_0_1px_var(--color-brand)]'
                  : 'border-[var(--color-border-hover)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-active)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-0)]'
              }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
              )}
              <div className="font-bold text-2xl tabular-nums leading-none">{count}</div>
              <div className="text-[var(--color-text-ghost)] text-[10px] uppercase tracking-wider mt-1.5">
                {count === 1 ? 'experiment' : 'experiments'}
              </div>
              <div className="mt-2 text-[11px] font-medium">
                {isFirst ? (
                  <span className="text-[var(--color-success)]">Included</span>
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
          Running multiple parallel experiments dramatically improves your odds of finding a winner — each tests a different angle so you learn fast and double down on what hits.
        </p>
      </div>
    </SectionCard>
  )
}
