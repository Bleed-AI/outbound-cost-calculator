import { SectionCard } from '@/components/SectionCard'
import { AddOnsIllustration } from '@/components/SectionIllustrations'
import { PRICING } from '@/lib/pricing.config'
import type { AddOns } from '@/lib/types'

interface AddOnsSectionProps {
  value: AddOns
  totalEmails: number
  baseTotal: number
  onChange: (key: keyof AddOns, v: boolean) => void
}

interface AddOnItem {
  key: keyof AddOns
  label: string
  description: string
  getPrice: (totalEmails: number, baseTotal: number) => string
  getPriceNote: (totalEmails: number, baseTotal: number) => string
  isWaived?: (totalEmails: number, baseTotal: number) => boolean
  getOriginalPrice?: (totalEmails: number) => string
}

const ADDONS: AddOnItem[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn Connection Requests',
    description:
      'BleedAI sends customised LinkedIn connection requests to leads who reply by email, and creates custom follow-up actions.',
    getPrice: () => `$${PRICING.addOns.linkedin_monthly}`,
    getPriceNote: () => '/month',
  },
  {
    key: 'crm',
    label: 'CRM Integration',
    description:
      'All positive leads are automatically pushed into your CRM, Slack channels, and other integrations.',
    getPrice: () => `$${PRICING.addOns.crm_monthly}`,
    getPriceNote: () => '/month',
  },
  {
    key: 'dripSequence',
    label: 'Custom Drip Sequence',
    description:
      'BleedAI builds a custom drip sequence to nurture leads after a positive response, keeping your brand top of mind.',
    getPrice: () => `$${PRICING.addOns.drip_onetime} setup`,
    getPriceNote: () => `+ $${PRICING.addOns.drip_monthly}/month`,
  },
  {
    key: 'infraManagement',
    label: 'Infrastructure Management & Domain Rotation',
    description:
      "Ongoing management of your sending infrastructure: domain/inbox rotation, health monitoring, and reporting.",
    getPrice: (totalEmails, baseTotal) => {
      const cost = Math.round((totalEmails / 1000) * PRICING.addOns.infra_management)
      return baseTotal >= PRICING.infraWaiverThreshold ? '$0' : `$${cost}`
    },
    getPriceNote: (totalEmails, baseTotal) =>
      baseTotal >= PRICING.infraWaiverThreshold ? 'included' : '/month',
    isWaived: (_, baseTotal) => baseTotal >= PRICING.infraWaiverThreshold,
    getOriginalPrice: (totalEmails) => {
      const cost = Math.round((totalEmails / 1000) * PRICING.addOns.infra_management)
      return `$${cost}`
    },
  },
  {
    key: 'instantlySetup',
    label: 'Instantly Account Setup',
    description:
      'Full Instantly.ai integration: account setup, warm-up configuration, campaign structure, and SOPs for running the system.',
    getPrice: () => `$${PRICING.setup.instantly_setup}`,
    getPriceNote: () => 'one-time',
  },
  {
    key: 'landingPage',
    label: 'Landing Page Build',
    description:
      'We create a high-end landing page for your offer — the kind agencies charge $3.5k for.',
    getPrice: () => `$${PRICING.addOns.landingPage}`,
    getPriceNote: () => 'one-time',
  },
]

export function AddOnsSection({ value, totalEmails, baseTotal, onChange }: AddOnsSectionProps) {
  const infraRemaining = PRICING.infraWaiverThreshold - baseTotal
  const showInfraNudge = infraRemaining > 0 && infraRemaining <= PRICING.infraWaiverThreshold * 0.3

  return (
    <SectionCard title="Optional Add-Ons" description="Extras to enhance your campaign." illustration={<AddOnsIllustration />}>
      <div className="space-y-2">
        {ADDONS.map((addon) => {
          const isSelected = value[addon.key]
          const waived = addon.isWaived?.(totalEmails, baseTotal) ?? false
          const price = addon.getPrice(totalEmails, baseTotal)
          const priceNote = addon.getPriceNote(totalEmails, baseTotal)
          const originalPrice = waived ? addon.getOriginalPrice?.(totalEmails) : undefined
          return (
            <label
              key={addon.key}
              className={`flex items-start gap-4 p-4 rounded-[var(--radius-inner)] cursor-pointer border transition-all duration-150 hover:border-[var(--color-border-hover)] ${
                isSelected
                  ? 'border-[var(--color-border-active)] bg-[var(--color-brand-muted)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)]'
              }`}
            >
              {/* Checkbox */}
              <div className="mt-0.5 flex-shrink-0">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[var(--color-brand)] bg-[var(--color-brand)]' : 'border-[var(--color-text-ghost)]'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onChange(addon.key, e.target.checked)}
                className="sr-only"
              />

              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${isSelected ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                  {addon.label}
                </div>
                <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mt-1">{addon.description}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                {originalPrice && (
                  <div className="text-[var(--color-text-ghost)] text-xs line-through">{originalPrice}</div>
                )}
                <div className={`font-semibold text-sm ${
                  waived ? 'text-[var(--color-success)]' : isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'
                }`}>
                  {price}
                </div>
                <div className="text-[var(--color-text-ghost)] text-xs mt-0.5">{priceNote}</div>
              </div>
            </label>
          )
        })}
      </div>

      {/* Infra waiver unlock nudge */}
      {showInfraNudge && (
        <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-inner)] bg-[var(--color-success-bg)] border border-[rgba(52,211,153,0.15)] px-3 py-2">
          <svg className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-[var(--color-success)] text-xs">
            ${Math.ceil(infraRemaining).toLocaleString()} more to include infrastructure management free
          </span>
        </div>
      )}
    </SectionCard>
  )
}
