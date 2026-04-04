'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, COUPON_CODES, getContractDates } from '@/lib/pricing'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { MagneticButton } from '@/components/MagneticButton'
import type { PricingResult, LineItem } from '@/lib/types'
import { spring } from '@/lib/motion'

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface CostBreakdownProps {
  result: PricingResult
  coupon: string
  onCouponChange: (v: string) => void
  onSubmit: () => void
}

const PERIOD_LABELS: Record<string, string> = {
  'one-time': 'one-time',
  monthly: '/mo',
  'per-campaign': '/campaign',
}

export function CostBreakdown({ result, coupon, onCouponChange, onSubmit }: CostBreakdownProps) {
  const { lineItems, fixedSubtotal, variableSubtotal, addonSubtotal, discountAmount, discountPercent, total, couponDiscountAmount, couponDiscountPercent } = result

  const fixedItems = lineItems.filter((i) => i.type === 'fixed')
  const variableItems = lineItems.filter((i) => i.type === 'variable')
  const addonItems = lineItems.filter((i) => i.type === 'addon')

  const { start: contractStart, end: contractEnd } = getContractDates()

  const [typedCoupon, setTypedCoupon] = useState(coupon)
  const [couponStatus, setCouponStatus] = useState<'idle' | 'applied' | 'invalid'>(
    coupon ? 'applied' : 'idle'
  )

  function handleApply() {
    const code = typedCoupon.trim().toUpperCase()
    if (COUPON_CODES[code]) {
      onCouponChange(code)
      setCouponStatus('applied')
    } else {
      setCouponStatus('invalid')
    }
  }

  function handleClear() {
    setTypedCoupon('')
    onCouponChange('')
    setCouponStatus('idle')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleApply()
  }

  return (
    <div className="lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto breakdown-scroll">
      {/* Double-bezel card with glass accent */}
      <div className="relative rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-px overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--color-brand)] opacity-[0.04] blur-[60px] pointer-events-none" />
        {/* Top glass shimmer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="relative rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] px-5 py-5">

          {/* Overline */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
            <h2 className="text-[var(--color-text)] font-medium text-sm tracking-tight">Cost Breakdown</h2>
          </div>

          {/* Contract period */}
          <div className="mb-4 rounded-[var(--radius-inner)] bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 py-2 flex items-center justify-between">
            <span className="text-[var(--color-text-dim)] text-xs">Contract period</span>
            <span className="text-[var(--color-text-muted)] text-xs font-medium font-[family-name:var(--font-mono)] tabular-nums">
              {formatDate(contractStart)} – {formatDate(contractEnd)}
            </span>
          </div>

          {/* Line items */}
          <div className="space-y-1 mb-4">
            {fixedItems.length > 0 && (
              <>
                <div className="text-[var(--color-text-ghost)] text-[11px] font-medium uppercase tracking-widest pt-1 pb-1">
                  Fixed Costs
                </div>
                {fixedItems.map((item, i) => (
                  <LineItemRow key={i} item={item} />
                ))}
              </>
            )}

            {variableItems.length > 0 && (
              <>
                <div className="text-[var(--color-text-ghost)] text-[11px] font-medium uppercase tracking-widest pt-3 pb-1">
                  Variable Costs{discountPercent > 0 && ` (${discountPercent}% volume discount applied)`}
                  {result.isFirstMonthBranded && result.month1ActualEmails != null && (
                    <span className="ml-1 normal-case tracking-normal font-normal text-[var(--color-text-ghost)]">
                      — {result.month1ActualEmails.toLocaleString()} emails billed (month 1 ramp)
                    </span>
                  )}
                </div>
                {variableItems.map((item, i) => (
                  <LineItemRow key={i} item={item} />
                ))}
              </>
            )}

            {addonItems.length > 0 && (
              <>
                <div className="text-[var(--color-text-ghost)] text-[11px] font-medium uppercase tracking-widest pt-3 pb-1">
                  Add-Ons
                </div>
                {addonItems.map((item, i) => (
                  <LineItemRow key={i} item={item} />
                ))}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)] my-4" />

          {/* Volume discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-[var(--color-text-dim)]">Volume Discount ({discountPercent}% off variable costs)</span>
              <span className="text-[var(--color-success)] font-medium font-[family-name:var(--font-mono)]">-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          {/* Coupon discount line */}
          {couponDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-[var(--color-text-dim)]">
                Coupon{' '}
                <span className="text-[var(--color-text-muted)] font-[family-name:var(--font-mono)] text-xs bg-[var(--color-surface-0)] px-1.5 py-0.5 rounded">
                  {coupon}
                </span>{' '}
                ({couponDiscountPercent}% off)
              </span>
              <span className="text-[var(--color-success)] font-medium font-[family-name:var(--font-mono)]">-{formatCurrency(couponDiscountAmount)}</span>
            </div>
          )}

          {/* Coupon input */}
          {couponStatus === 'applied' ? (
            <div className="flex items-center gap-2 mt-3 mb-4 bg-[var(--color-success-bg)] border border-[rgba(52,211,153,0.15)] rounded-[var(--radius-inner)] px-3 py-2">
              <svg className="w-4 h-4 text-[var(--color-success)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[var(--color-success)] text-sm flex-1">
                Code <span className="font-[family-name:var(--font-mono)] font-semibold">{coupon}</span> applied — {couponDiscountPercent}% off
              </span>
              <button
                onClick={handleClear}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] text-xs transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={typedCoupon}
                    onChange={(e) => {
                      setTypedCoupon(e.target.value.toUpperCase())
                      if (couponStatus === 'invalid') setCouponStatus('idle')
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-[var(--color-bg)] border rounded-[var(--radius-inner)] px-3 py-2 text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-ghost)] focus:outline-none transition-colors ${
                      couponStatus === 'invalid'
                        ? 'border-red-500/50 focus:border-red-500/70'
                        : 'border-[var(--color-border-hover)] focus:border-[var(--color-border-active)]'
                    }`}
                  />
                </div>
                <button
                  className="px-4 py-2 rounded-[var(--radius-inner)] border border-[var(--color-border-hover)] text-[var(--color-text-dim)] text-sm hover:border-[var(--color-border-active)] hover:text-[var(--color-text-muted)] transition-all"
                  onClick={handleApply}
                >
                  Apply
                </button>
              </div>
              {couponStatus === 'invalid' && (
                <p className="text-red-400 text-xs mt-1.5">Invalid coupon code.</p>
              )}
            </div>
          )}

          {/* Grand total — animated */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-[var(--color-text)] font-semibold">Campaign Total</span>
            <AnimatedNumber
              value={total}
              className="text-[var(--color-text)] font-bold text-3xl font-[family-name:var(--font-mono)] tabular-nums"
            />
          </div>

          {/* Breakdown by type */}
          <div className="space-y-0.5 mb-5">
            {fixedSubtotal > 0 && (
              <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
                <span>Fixed (one-time)</span>
                <span className="font-[family-name:var(--font-mono)] tabular-nums">{formatCurrency(fixedSubtotal)}</span>
              </div>
            )}
            {variableSubtotal > 0 && (
              <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
                <span>Variable (volume-based)</span>
                <span className="font-[family-name:var(--font-mono)] tabular-nums">{formatCurrency(variableSubtotal)}</span>
              </div>
            )}
            {addonSubtotal > 0 && (
              <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
                <span>Add-ons</span>
                <span className="font-[family-name:var(--font-mono)] tabular-nums">{formatCurrency(addonSubtotal)}</span>
              </div>
            )}
          </div>

          {/* ROI Estimator */}
          <RoiEstimator totalEmails={result.totalEmails} campaignCost={total} />

          {/* Submit button — magnetic */}
          <MagneticButton
            onClick={onSubmit}
            className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] active:bg-[#9a0f0c] text-white font-semibold py-3.5 px-6 rounded-[var(--radius-inner)] transition-colors text-base cursor-pointer"
          >
            Submit Order — {formatCurrency(total)}
          </MagneticButton>
        </div>
      </div>
    </div>
  )
}

/* ── Helper components ──────────────────────────────────── */

function RateInput({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--color-text-dim)] text-[11px] flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          className="w-14 bg-[var(--color-bg)] border border-[var(--color-border-hover)] rounded px-2 py-1 text-[var(--color-text)] text-xs text-right tabular-nums focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
        />
        <span className="text-[var(--color-text-ghost)] text-[10px]">%</span>
      </div>
    </div>
  )
}

interface AiEstimate {
  companyDescription: string
  replyRate: number
  positiveReplyRate: number
  reasoning: string
}

function RoiEstimator({ totalEmails, campaignCost }: { totalEmails: number; campaignCost: number }) {
  const [isOpen, setIsOpen] = useState(false)

  const [domain, setDomain] = useState('')
  const [researching, setResearching] = useState(false)
  const [aiResult, setAiResult] = useState<AiEstimate | null>(null)
  const [aiError, setAiError] = useState('')

  const [dealSize, setDealSize] = useState('')

  const [replyRate, setReplyRate] = useState(3)
  const [positiveRate, setPositiveRate] = useState(30)
  const [meetingRate, setMeetingRate] = useState(50)
  const [closeRate, setCloseRate] = useState(25)

  const dealValue = Number(dealSize.replace(/[^0-9]/g, ''))

  const totalReplies = Math.round(totalEmails * (replyRate / 100))
  const positiveReplies = Math.round(totalReplies * (positiveRate / 100))
  const meetingsBooked = Math.round(positiveReplies * (meetingRate / 100))
  const dealsClosed = Math.round(meetingsBooked * (closeRate / 100))
  const pipelineValue = positiveReplies * dealValue
  const estimatedRevenue = dealsClosed * dealValue
  const roi = campaignCost > 0 && estimatedRevenue > 0
    ? Math.round((estimatedRevenue / campaignCost) * 100) / 100
    : 0

  async function handleResearch() {
    const cleanDomain = domain.trim()
    if (!cleanDomain) return

    setResearching(true)
    setAiError('')
    setAiResult(null)

    try {
      const res = await fetch('/api/estimate-roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAiError(data.error || 'Research failed')
        return
      }

      setAiResult(data)
      setReplyRate(data.replyRate)
      setPositiveRate(data.positiveReplyRate)
    } catch {
      setAiError('Network error — could not reach the server')
    } finally {
      setResearching(false)
    }
  }

  return (
    <div className="mb-5">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[var(--color-text-dim)] text-xs hover:text-[var(--color-text-muted)] transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Estimate your ROI</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-3 h-3"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-3 space-y-3">

              {/* Domain research */}
              <div>
                <label className="text-[var(--color-text-dim)] text-[11px] block mb-1">Your website</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="acmecorp.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleResearch() }}
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border-hover)] rounded-[var(--radius-inner)] px-3 py-2 text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-ghost)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
                  />
                  <button
                    onClick={handleResearch}
                    disabled={researching || !domain.trim()}
                    className="px-3 py-2 rounded-[var(--radius-inner)] bg-[var(--color-brand)] text-white text-xs font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                  >
                    {researching ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Researching...
                      </>
                    ) : 'Research'}
                  </button>
                </div>
                {aiError && (
                  <p className="text-red-400 text-[11px] mt-1.5">{aiError}</p>
                )}
              </div>

              {/* Loading state */}
              {researching && (
                <div className="rounded-[var(--radius-inner)] bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.12)] px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-3.5 h-3.5 text-[var(--color-brand)] animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-[var(--color-text-muted)] text-xs">Analyzing your industry and estimating conversion rates...</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface-0)] rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-[var(--color-brand)] rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {/* AI research results */}
              {aiResult && !researching && (
                <div className="rounded-[var(--radius-inner)] bg-[var(--color-success-bg)] border border-[rgba(52,211,153,0.12)] px-3 py-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-[var(--color-success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="space-y-1.5">
                      <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">{aiResult.companyDescription}</p>
                      <p className="text-[var(--color-text-dim)] text-[11px] leading-relaxed">{aiResult.reasoning}</p>
                      <div className="flex gap-3 pt-1">
                        <span className="text-[11px]">
                          <span className="text-[var(--color-text-ghost)]">Reply rate:</span>{' '}
                          <span className="text-[var(--color-text)] font-medium">{aiResult.replyRate}%</span>
                        </span>
                        <span className="text-[11px]">
                          <span className="text-[var(--color-text-ghost)]">Positive replies:</span>{' '}
                          <span className="text-[var(--color-text)] font-medium">{aiResult.positiveReplyRate}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deal value input */}
              <div>
                <label className="text-[var(--color-text-dim)] text-[11px] block mb-1">Average deal / contract value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="5,000"
                    value={dealSize}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '')
                      setDealSize(raw ? Number(raw).toLocaleString() : '')
                    }}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border-hover)] rounded-[var(--radius-inner)] pl-7 pr-3 py-2 text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-ghost)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
                  />
                </div>
              </div>

              {/* Conversion rates */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-wider">Conversion Rates</div>
                  {aiResult && <span className="text-[var(--color-text-ghost)] text-[10px]">AI-estimated, adjust as needed</span>}
                </div>
                <RateInput label="Reply rate" value={replyRate} onChange={setReplyRate} />
                <RateInput label="Positive reply rate (of replies)" value={positiveRate} onChange={setPositiveRate} />
                <RateInput label="Meetings booked (of positive)" value={meetingRate} onChange={setMeetingRate} />
                <RateInput label="Close rate (of meetings)" value={closeRate} onChange={setCloseRate} />
              </div>

              {/* Funnel results */}
              <div className="border-t border-[var(--color-border)] pt-3 space-y-1.5">
                <div className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-wider mb-2">Estimated Funnel</div>
                <FunnelRow label="Emails sent" value={totalEmails} />
                <FunnelRow label={`Replies (${replyRate}%)`} value={totalReplies} />
                <FunnelRow label={`Positive replies (${positiveRate}% of replies)`} value={positiveReplies} highlight />
                <FunnelRow label={`Meetings booked (${meetingRate}%)`} value={meetingsBooked} />
                <FunnelRow label={`Deals closed (${closeRate}%)`} value={dealsClosed} strong />
              </div>

              {/* Pipeline & revenue */}
              <div className="border-t border-[var(--color-border)] pt-3 space-y-2">
                <div className="text-[var(--color-text-ghost)] text-[10px] font-medium uppercase tracking-wider mb-2">Projected Value</div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2.5">
                    <div className="text-[var(--color-text-ghost)] text-[10px] uppercase tracking-wider">Pipeline Value</div>
                    <div className="text-[var(--color-text)] font-bold text-lg font-[family-name:var(--font-mono)] tabular-nums mt-0.5">
                      {formatCurrency(pipelineValue)}
                    </div>
                    <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5">
                      {positiveReplies} qualified leads
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-inner)] border border-[rgba(52,211,153,0.15)] bg-[var(--color-success-bg)] px-3 py-2.5">
                    <div className="text-[var(--color-text-ghost)] text-[10px] uppercase tracking-wider">Est. Revenue</div>
                    <div className="text-[var(--color-success)] font-bold text-lg font-[family-name:var(--font-mono)] tabular-nums mt-0.5">
                      {formatCurrency(estimatedRevenue)}
                    </div>
                    <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5">
                      {dealsClosed} closed deal{dealsClosed !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {roi > 0 && (
                  <div className="flex items-center justify-between rounded-[var(--radius-inner)] border border-[rgba(52,211,153,0.12)] bg-[var(--color-success-bg)] px-3 py-2">
                    <span className="text-[var(--color-text-muted)] text-xs">Return on investment</span>
                    <span className="text-[var(--color-success)] font-bold text-base font-[family-name:var(--font-mono)] tabular-nums">{roi}x ROI</span>
                  </div>
                )}

                {dealValue === 0 && (
                  <p className="text-[var(--color-text-ghost)] text-[10px] italic">Enter your average deal value above to see projected pipeline and revenue.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FunnelRow({ label, value, highlight, strong }: {
  label: string; value: number; highlight?: boolean; strong?: boolean
}) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[var(--color-text-dim)]">{label}</span>
      <span className={`font-[family-name:var(--font-mono)] tabular-nums ${
        strong ? 'text-[var(--color-text)] font-semibold' : highlight ? 'text-[var(--color-text-muted)] font-medium' : 'text-[var(--color-text-dim)]'
      }`}>
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function LineItemRow({ item }: { item: LineItem }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <span className="text-[var(--color-text-muted)] text-xs leading-relaxed flex-1">{item.label}</span>
      <div className="flex-shrink-0 text-right">
        <span className="text-[var(--color-text-muted)] text-xs font-medium font-[family-name:var(--font-mono)] tabular-nums">
          {formatCurrency(item.amount)}
        </span>
        <span className="text-[var(--color-text-ghost)] text-[10px] ml-1">{PERIOD_LABELS[item.period]}</span>
      </div>
    </div>
  )
}
