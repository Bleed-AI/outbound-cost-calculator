'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/pricing'
import { spring } from '@/lib/motion'

interface EligibilityNudgeProps {
  total: number
  threshold: number
}

export function EligibilityNudge({ total, threshold }: EligibilityNudgeProps) {
  const eligible = total >= threshold

  return (
    <AnimatePresence>
      {eligible && (
        <motion.a
          key="nudge"
          href="/packages"
          initial={{ opacity: 0, y: 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={spring}
          className="block group rounded-[var(--radius-inner)] border border-[rgba(177,19,15,0.35)] bg-gradient-to-br from-[var(--color-brand-muted)] to-transparent px-4 py-3 mb-3 hover:border-[var(--color-brand)] transition-colors overflow-hidden"
        >
          <div className="flex items-start gap-3">
            <span className="relative flex h-2 w-2 flex-shrink-0 mt-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand)] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand)]"></span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[var(--color-text)] text-sm font-semibold mb-0.5">
                You&apos;re close to retainer territory
              </div>
              <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                For around <span className="text-[var(--color-text)] font-medium">{formatCurrency(total)}</span> on a single one-off, our <span className="text-[var(--color-brand)] font-semibold">monthly packages</span> give you ongoing experiments and full ops — every month, with much better economics at scale.
              </p>
              <div className="mt-2 flex items-center gap-1 text-[var(--color-brand)] text-xs font-semibold group-hover:gap-2 transition-all">
                See packages
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
