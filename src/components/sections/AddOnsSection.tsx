import { SectionCard } from '@/components/SectionCard'
import { PRICING } from '@/lib/pricing.config'
import type { AddOns } from '@/lib/types'

interface AddOnsSectionProps {
  value: AddOns
  onChange: (key: keyof AddOns, v: boolean) => void
}

interface AddOnItem {
  key: keyof AddOns
  label: string
  description: string
  price: string
  priceNote: string
}

const ADDONS: AddOnItem[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn Connection Requests',
    description:
      'Send customised LinkedIn connection requests to leads who reply on email, and create custom follow-up actions.',
    price: `$${PRICING.addOns.linkedin_monthly}`,
    priceNote: '/month',
  },
  {
    key: 'crm',
    label: 'CRM Integration',
    description: 'All positive leads automatically pushed into your CRM.',
    price: `$${PRICING.addOns.crm_monthly}`,
    priceNote: '/month',
  },
  {
    key: 'dripSequence',
    label: 'Custom Drip Sequence',
    description:
      'Nurture leads after a positive response with a custom-built drip sequence.',
    price: `$${PRICING.addOns.drip_onetime} setup`,
    priceNote: `+ $${PRICING.addOns.drip_monthly}/month`,
  },
  {
    key: 'infraManagement',
    label: 'Infrastructure Management & Domain Rotation',
    description:
      'Ongoing management of your Instantly infrastructure, domain/inbox rotation protocols, reporting, and domain health monitoring. Required when using your own branded domains in your Instantly account.',
    price: `$${PRICING.addOns.infra_management}`,
    priceNote: 'one-time',
  },
]

export function AddOnsSection({ value, onChange }: AddOnsSectionProps) {
  return (
    <SectionCard title="Custom Add-Ons" description="Optional extras to enhance your campaign.">
      <div className="space-y-2">
        {ADDONS.map((addon) => {
          const isSelected = value[addon.key]
          return (
            <label
              key={addon.key}
              className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer border transition-all duration-150 hover:border-white/20 ${
                isSelected
                  ? 'border-[#B1130F] bg-[#B1130F]/8'
                  : 'border-white/8 bg-[#050508]'
              }`}
            >
              {/* Checkbox */}
              <div className="mt-0.5 flex-shrink-0">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[#B1130F] bg-[#B1130F]' : 'border-gray-600'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {addon.label}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mt-1">{addon.description}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className={`font-semibold text-sm ${isSelected ? 'text-[#e84040]' : 'text-gray-400'}`}>
                  {addon.price}
                </div>
                <div className="text-gray-600 text-xs mt-0.5">{addon.priceNote}</div>
              </div>
            </label>
          )
        })}
      </div>
    </SectionCard>
  )
}
