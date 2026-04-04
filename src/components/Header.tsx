'use client'

import { motion } from 'framer-motion'
import { spring } from '@/lib/motion'

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

export function Header() {
  return (
    <header className="relative bg-[var(--color-bg)] border-b border-[var(--color-border)] overflow-hidden">
      {/* Ambient glow behind hero */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--color-brand)] opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-[var(--color-brand)] opacity-[0.02] blur-[80px] pointer-events-none" />

      {/* Nav */}
      <div className="relative max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <a href="https://bleedai.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bleed-ai-logo.svg" alt="BleedAI" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Asymmetric hero */}
      <div className="relative max-w-6xl mx-auto px-4 pb-12 pt-8">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="visible"
        >
          {/* Line 1 */}
          <div className="flex flex-wrap gap-x-4">
            {['Cold', 'Outreach'].map((word) => (
              <motion.span
                key={word}
                variants={wordVariants}
                transition={spring}
                className="text-[var(--color-text)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
              >
                {word}
              </motion.span>
            ))}
          </div>
          {/* Line 2 — "Cost" in crimson with glow */}
          <div className="flex flex-wrap gap-x-4 mt-1">
            <motion.span
              variants={wordVariants}
              transition={spring}
              className="relative text-[var(--color-brand)] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
            >
              Cost
              {/* Text glow effect */}
              <span className="absolute inset-0 text-[var(--color-brand)] blur-lg opacity-30 pointer-events-none select-none" aria-hidden="true">
                Cost
              </span>
            </motion.span>
            <motion.span
              variants={wordVariants}
              transition={spring}
              className="text-[var(--color-text)] text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight"
            >
              Calculator
            </motion.span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[var(--color-text-muted)] text-base mt-5 max-w-md"
        >
          Configure your campaign below and get an instant price.
        </motion.p>

        {/* Gradient rule with glow */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-8 origin-left"
        >
          <div className="h-px" style={{ background: 'linear-gradient(to right, var(--color-brand), transparent 60%)' }} />
          <div className="h-4 -mt-2" style={{ background: 'linear-gradient(to right, rgba(177,19,15,0.1), transparent 40%)' }} />
        </motion.div>
      </div>
    </header>
  )
}
