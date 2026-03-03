import { SectionCard } from '@/components/SectionCard'
import { LEADS_OPTIONS, EPP_OPTIONS } from '@/lib/pricing'
import { PRICING } from '@/lib/pricing.config'
import type { LeadsPerMonth, EmailsPerProspect } from '@/lib/types'

interface CampaignVolumeSectionProps {
  leads: LeadsPerMonth
  emailsPerProspect: EmailsPerProspect
  totalEmails: number
  onLeadsChange: (v: LeadsPerMonth) => void
  onEmailsChange: (v: EmailsPerProspect) => void
}

const EPP_LABELS: Record<number, { label: string; badge?: string }> = {
  1: { label: '1 Email' },
  2: { label: '2 Emails', badge: 'Recommended' },
  3: { label: '3 Emails' },
}

export function CampaignVolumeSection({
  leads,
  emailsPerProspect,
  totalEmails,
  onLeadsChange,
  onEmailsChange,
}: CampaignVolumeSectionProps) {
  const discount = PRICING.volumeDiscounts[leads]
  const discountPct = Math.round(discount * 100)

  return (
    <SectionCard
      title="Campaign Volume"
      description="How many leads do you want to reach per month, and how many follow-up emails per prospect?"
    >
      {/* Leads per month */}
      <div className="mb-5">
        <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 block">
          Leads per Month
        </label>
        <div className="flex flex-wrap gap-2">
          {LEADS_OPTIONS.map((opt) => {
            const d = PRICING.volumeDiscounts[opt]
            const pct = Math.round(d * 100)
            const isSelected = leads === opt
            return (
              <button
                key={opt}
                onClick={() => onLeadsChange(opt)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-[#B1130F] bg-[#B1130F]/10 text-white'
                    : 'border-white/10 bg-[#050508] text-gray-400 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                {opt.toLocaleString()}
                {pct > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] font-semibold ${
                      isSelected ? 'text-green-400' : 'text-gray-600'
                    }`}
                  >
                    -{pct}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {discountPct > 0 && (
          <p className="text-green-400/80 text-xs mt-2">
            ✓ {discountPct}% volume discount applied to all per-1k costs
          </p>
        )}
      </div>

      {/* Emails per prospect */}
      <div className="mb-5">
        <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 block">
          Emails per Prospect
        </label>
        <div className="flex gap-2">
          {EPP_OPTIONS.map((opt) => {
            const { label, badge } = EPP_LABELS[opt]
            const isSelected = emailsPerProspect === opt
            return (
              <button
                key={opt}
                onClick={() => onEmailsChange(opt)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'border-[#B1130F] bg-[#B1130F]/10 text-white font-medium'
                    : 'border-white/10 bg-[#050508] text-gray-400 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                {label}
                {badge && (
                  <span className="ml-1.5 text-[10px] text-[#e84040] font-semibold">{badge}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Total email count */}
      <div className="flex items-center gap-3 bg-[#050508] border border-white/8 rounded-lg px-4 py-3">
        <div className="w-8 h-8 rounded-lg bg-[#B1130F]/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#B1130F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Total Emails to be Sent</div>
          <div className="text-white font-bold text-lg tabular-nums">
            {totalEmails.toLocaleString()}
          </div>
        </div>
        <div className="ml-auto text-gray-600 text-xs text-right">
          {leads.toLocaleString()} leads<br />× {emailsPerProspect} emails
        </div>
      </div>
    </SectionCard>
  )
}
