'use client'

import { formatCurrency } from '@/lib/pricing'
import type { PricingResult } from '@/lib/types'

interface FloatingTotalProps {
  result: PricingResult
}

export function FloatingTotal({ result }: FloatingTotalProps) {
  const { total, discountAmount, discountPercent } = result

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0a10]/95 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo mark */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bleed-ai-logo.svg" alt="BleedAI" className="h-5 w-auto opacity-70" />
        </div>

        {/* Breakdown */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center text-sm">
          {discountPercent > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-gray-500 text-xs">Volume Discount</span>
              <span className="text-green-400 font-medium">
                -{formatCurrency(discountAmount)} ({discountPercent}% off)
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-gray-400 text-sm hidden sm:block">Campaign Total</span>
          <div className="bg-[#B1130F] text-white font-bold text-base sm:text-lg px-4 py-1.5 rounded-lg tabular-nums">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
    </div>
  )
}
