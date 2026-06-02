'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { spring } from '@/lib/motion'
import { TopNav } from '@/components/TopNav'

interface HeaderProps {
  /**
   * Visual variant — controls the hero treatment. Each variant renders the same
   * 3-line title with a different word emphasized in brand red, and an
   * appropriate subtitle for the page.
   */
  variant?: 'calculator' | 'trials' | 'packages'
}

const VARIANT_CONFIG: Record<NonNullable<HeaderProps['variant']>, {
  line1: string
  line2: { plain: string; accent: string; tail?: string; accentMode: 'plain' | 'black' | 'light' }
  subtitle: string
}> = {
  calculator: {
    line1: 'Cold Outreach',
    line2: { plain: '', accent: 'Cost', tail: 'Calculator', accentMode: 'black' },
    subtitle: 'Price a single one-off campaign. Want to test cold email for your business first? Try a trial campaign instead.',
  },
  trials: {
    line1: 'Trial',
    line2: { plain: '', accent: 'Cold Outreach', tail: 'Campaigns', accentMode: 'black' },
    subtitle: 'Short, focused campaign experiments — we set up, we send, we stop when we find the angle that works for you.',
  },
  packages: {
    line1: 'Outbound',
    line2: { plain: '', accent: 'Retainer', tail: 'Packages', accentMode: 'black' },
    subtitle: 'Ongoing outbound built for serious B2B teams — multiple experiments, full ops, scaling what wins.',
  },
}

export function Header({ variant = 'calculator' }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const cfg = VARIANT_CONFIG[variant]

  const renderLine2 = () => (
    <div className="flex flex-wrap gap-x-4 mt-1 items-baseline">
      <span className="relative text-[var(--color-brand)] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
        {cfg.line2.accent}
        <span className="absolute inset-0 text-[var(--color-brand)] blur-lg opacity-30 pointer-events-none select-none" aria-hidden="true">
          {cfg.line2.accent}
        </span>
      </span>
      {cfg.line2.tail && (
        <span className="text-[var(--color-text)] text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
          {cfg.line2.tail}
        </span>
      )}
    </div>
  )

  return (
    <header className="relative bg-[var(--color-bg)] border-b border-[var(--color-border)] overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--color-brand)] opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-[var(--color-brand)] opacity-[0.02] blur-[80px] pointer-events-none" />

      {/* Top nav row */}
      <div className="relative max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <a href="https://bleedai.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bleed-ai-logo.svg" alt="BleedAI" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
        </a>
        <TopNav current={variant} />
      </div>

      {/* Asymmetric hero */}
      <div className="relative max-w-6xl mx-auto px-4 pb-12 pt-8">
        {mounted ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
          >
            <div className="flex flex-wrap gap-x-4">
              {cfg.line1.split(' ').map((word) => (
                <span
                  key={word}
                  className="text-[var(--color-text)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
                >
                  {word}
                </span>
              ))}
            </div>
            {renderLine2()}
          </motion.div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-x-4">
              {cfg.line1.split(' ').map((word) => (
                <span key={word} className="text-[var(--color-text)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">{word}</span>
              ))}
            </div>
            {renderLine2()}
          </div>
        )}

        {mounted ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[var(--color-text-muted)] text-base mt-5 max-w-xl leading-relaxed"
          >
            {cfg.subtitle}
            {variant === 'calculator' && (
              <>
                {' '}
                <a href="/trials" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline transition-colors">Try a trial campaign →</a>
              </>
            )}
          </motion.p>
        ) : (
          <p className="text-[var(--color-text-muted)] text-base mt-5 max-w-xl leading-relaxed">
            {cfg.subtitle}
            {variant === 'calculator' && (
              <>
                {' '}
                <a href="/trials" className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium underline-offset-4 hover:underline transition-colors">Try a trial campaign →</a>
              </>
            )}
          </p>
        )}

        {mounted ? (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-8 origin-left"
          >
            <div className="h-px" style={{ background: 'linear-gradient(to right, var(--color-brand), transparent 60%)' }} />
            <div className="h-4 -mt-2" style={{ background: 'linear-gradient(to right, rgba(177,19,15,0.1), transparent 40%)' }} />
          </motion.div>
        ) : (
          <div className="relative mt-8">
            <div className="h-px" style={{ background: 'linear-gradient(to right, var(--color-brand), transparent 60%)' }} />
            <div className="h-4 -mt-2" style={{ background: 'linear-gradient(to right, rgba(177,19,15,0.1), transparent 40%)' }} />
          </div>
        )}
      </div>
    </header>
  )
}
