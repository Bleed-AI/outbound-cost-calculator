'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeUp, spring } from '@/lib/motion'

interface SectionCardProps {
  title: string
  description?: string
  optional?: boolean
  children: ReactNode
  delay?: number
  illustration?: ReactNode
}

export function SectionCard({ title, description, optional, children, delay = 0, illustration }: SectionCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div className="space-y-2" ref={ref}>
      {/* Title sits above the card */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
        <h2 className="text-[var(--color-text)] font-medium text-sm tracking-tight">{title}</h2>
        {optional && (
          <span className="text-[10px] font-medium text-[var(--color-text-dim)] border border-[var(--color-border-hover)] rounded-full px-2 py-0.5 tracking-wide uppercase">
            Optional
          </span>
        )}
      </div>

      {/* Double-bezel card with glass accent */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={{ ...spring, delay }}
      >
        {/* Outer bezel */}
        <div className="relative rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-px overflow-hidden">
          {/* Glass shimmer on top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Inner core */}
          <div className="relative rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] px-5 py-4 sm:px-6 sm:py-5">
            {/* Illustration — decorative, top-right, desktop only */}
            {illustration && (
              <div className="absolute top-2 right-2 w-20 h-20 opacity-30 mix-blend-screen pointer-events-none hidden lg:block">
                {illustration}
              </div>
            )}

            {description && (
              <p className="text-[var(--color-text-dim)] text-sm leading-relaxed mb-4 relative">{description}</p>
            )}
            <div className="relative">{children}</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
