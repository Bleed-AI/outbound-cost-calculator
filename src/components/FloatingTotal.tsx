'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/pricing'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import type { PricingResult } from '@/lib/types'

interface FloatingTotalProps {
  result: PricingResult
}

export function FloatingTotal({ result }: FloatingTotalProps) {
  const { total, discountAmount, discountPercent } = result

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Gradient top border */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(to right, transparent 10%, var(--color-brand) 50%, transparent 90%)' }}
      />

      {/* Glass bar */}
      <div className="bg-[var(--color-bg)]/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bleed-ai-logo.svg" alt="BleedAI" className="h-5 w-auto opacity-60" />
          </div>

          {/* Discount */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center text-sm">
            {discountPercent > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[var(--color-text-dim)] text-xs">Volume Discount</span>
                <span className="text-[var(--color-success)] font-medium font-[family-name:var(--font-mono)]">
                  -{formatCurrency(discountAmount)} ({discountPercent}% off)
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[var(--color-text-dim)] text-sm hidden sm:block">Campaign Total</span>
            <div className="bg-[var(--color-brand)] text-white font-bold text-base sm:text-lg px-4 py-1.5 rounded-[var(--radius-button)] font-[family-name:var(--font-mono)] tabular-nums">
              <AnimatedNumber value={total} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
