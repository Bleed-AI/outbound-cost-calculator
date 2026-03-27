'use client'

import { useState } from 'react'
import { formatCurrency, COUPON_CODES, getContractDates } from '@/lib/pricing'
import { PRICING } from '@/lib/pricing.config'
import type { PricingResult } from '@/lib/types'

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

  // Local coupon input state (separate from applied coupon in URL state)
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
    <div className="relative bg-[#0d0d14] border border-white/8 rounded-xl overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B1130F]" />

      <div className="px-6 py-5 pl-8">
        <h2 className="text-white font-semibold text-base mb-3">Cost Breakdown</h2>

        {/* Contract period */}
        <div className="mb-4 rounded-lg bg-white/[0.02] border border-white/8 px-3 py-2 flex items-center justify-between">
          <span className="text-gray-500 text-xs">Contract period</span>
          <span className="text-gray-300 text-xs font-medium tabular-nums">
            {formatDate(contractStart)} – {formatDate(contractEnd)}
          </span>
        </div>

        {/* Line items */}
        <div className="space-y-1 mb-4">
          {fixedItems.length > 0 && (
            <>
              <div className="text-gray-600 text-[11px] font-medium uppercase tracking-widest pt-1 pb-1">
                Fixed Costs
              </div>
              {fixedItems.map((item, i) => (
                <LineItemRow key={i} item={item} />
              ))}
            </>
          )}

          {variableItems.length > 0 && (
            <>
              <div className="text-gray-600 text-[11px] font-medium uppercase tracking-widest pt-3 pb-1">
                Variable Costs{discountPercent > 0 && ` (${discountPercent}% volume discount applied)`}
                {result.isFirstMonthBranded && result.month1ActualEmails != null && (
                  <span className="ml-1 normal-case tracking-normal font-normal text-gray-600">
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
              <div className="text-gray-600 text-[11px] font-medium uppercase tracking-widest pt-3 pb-1">
                Add-Ons
              </div>
              {addonItems.map((item, i) => (
                <LineItemRow key={i} item={item} />
              ))}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 my-4" />

        {/* Volume discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-500">Volume Discount ({discountPercent}% off variable costs)</span>
            <span className="text-green-400 font-medium">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        {/* Coupon discount line (shown after applied) */}
        {couponDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-500">
              Coupon{' '}
              <span className="text-gray-400 font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
                {coupon}
              </span>{' '}
              ({couponDiscountPercent}% off)
            </span>
            <span className="text-green-400 font-medium">-{formatCurrency(couponDiscountAmount)}</span>
          </div>
        )}

        {/* Coupon input */}
        {couponStatus === 'applied' ? (
          <div className="flex items-center gap-2 mt-3 mb-4 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-400 text-sm flex-1">
              Code <span className="font-mono font-semibold">{coupon}</span> applied — {couponDiscountPercent}% off
            </span>
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
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
                  className={`w-full bg-[#050508] border rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-colors ${
                    couponStatus === 'invalid'
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/10 focus:border-[#B1130F]/50'
                  }`}
                />
              </div>
              <button
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-gray-200 transition-all"
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

        {/* Grand total */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-white font-semibold">Campaign Total</span>
          <span className="text-white font-bold text-2xl tabular-nums">{formatCurrency(total)}</span>
        </div>

        {/* Breakdown by type */}
        <div className="space-y-0.5 mb-5">
          {fixedSubtotal > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Fixed (one-time)</span>
              <span>{formatCurrency(fixedSubtotal)}</span>
            </div>
          )}
          {variableSubtotal > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Variable (volume-based)</span>
              <span>{formatCurrency(variableSubtotal)}</span>
            </div>
          )}
          {addonSubtotal > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Add-ons</span>
              <span>{formatCurrency(addonSubtotal)}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <p className="text-gray-600 text-xs mb-1.5">
          Any additional work outside scope is charged at{' '}
          <span className="text-gray-500">${PRICING.hourlyRate}/hr</span>.
        </p>
        <p className="text-gray-600 text-xs mb-5">
          Delays in invoice clearance do not extend the contract period.
        </p>

        {/* Submit button */}
        <button
          onClick={onSubmit}
          className="w-full bg-[#B1130F] hover:bg-[#d41510] active:bg-[#9a0f0c] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors text-base"
        >
          Submit Order — {formatCurrency(total)}
        </button>
      </div>
    </div>
  )
}

import type { LineItem } from '@/lib/types'

function LineItemRow({ item }: { item: LineItem }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <span className="text-gray-400 text-xs leading-relaxed flex-1">{item.label}</span>
      <div className="flex-shrink-0 text-right">
        <span className="text-gray-300 text-xs font-medium tabular-nums">
          {formatCurrency(item.amount)}
        </span>
        <span className="text-gray-600 text-[10px] ml-1">{PERIOD_LABELS[item.period]}</span>
      </div>
    </div>
  )
}
