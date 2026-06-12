'use client'

import { motion } from 'framer-motion'
import { BRAND_ICONS } from '@/lib/brand-icons'

/**
 * Premium, categorized showcase of the real tools BleedAI operates. Where an
 * official vector mark is available (Google Maps, Claude, n8n, Supabase,
 * Cloudflare) we render it; everything else gets a clean monogram tile. Every
 * tile carries the tool name so the grid reads as a deliberate, legit stack.
 * Tiles float gently and lift/accent on hover.
 */

type Tool = {
  name: string
  /** key into BRAND_ICONS for an official vector mark */
  icon?: keyof typeof BRAND_ICONS
  /** monogram shown when there's no vector mark */
  mono?: string
}

type Category = {
  label: string
  blurb: string
  tools: Tool[]
}

const CATEGORIES: Category[] = [
  {
    label: 'Sourcing',
    blurb: 'finding the right companies & people',
    tools: [
      { name: 'LinkedIn Sales Nav', mono: 'in' },
      { name: 'Google Maps', icon: 'googlemaps' },
      { name: 'Apollo', mono: 'Ap' },
      { name: 'Apify', mono: 'ay' },
      { name: 'Niche Directories', mono: '☰' },
    ],
  },
  {
    label: 'Email Finding',
    blurb: 'verified emails, multi-provider waterfall',
    tools: [
      { name: 'Prospeo', mono: 'P' },
      { name: 'TryKit', mono: 'K' },
      { name: 'LeadMagic', mono: 'LM' },
      { name: 'FindyMail', mono: 'FM' },
    ],
  },
  {
    label: 'Enrichment',
    blurb: 'context & signals on every lead',
    tools: [
      { name: 'Parallel.ai', mono: '∥' },
      { name: 'Serper', mono: 'Se' },
      { name: 'OpenWebNinja', mono: 'ON' },
      { name: 'AI Personalization', mono: '✦' },
    ],
  },
  {
    label: 'Orchestration & AI',
    blurb: 'running the whole machine',
    tools: [
      { name: 'Clay', mono: 'Cl' },
      { name: 'Claude Code', icon: 'claude' },
      { name: 'OpenAI', mono: 'AI' },
      { name: 'n8n', icon: 'n8n' },
    ],
  },
  {
    label: 'Sending & Infra',
    blurb: 'branded inboxes, delivery, data',
    tools: [
      { name: 'Instantly', mono: 'I' },
      { name: 'Supabase', icon: 'supabase' },
      { name: 'Cloudflare', icon: 'cloudflare' },
    ],
  },
]

export function ToolStack() {
  return (
    <div className="mb-12">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-1.5">
        <span className="h-px w-6 bg-[var(--color-brand)]" />
        <h3 className="text-[var(--color-text)] text-sm font-semibold tracking-tight">The stack we run for you</h3>
      </div>
      <p className="text-[var(--color-text-dim)] text-xs mb-6 max-w-2xl leading-relaxed">
        Not a freelancer with a list — a full sourcing, enrichment and sending operation. The same tooling powers every tier; higher tiers just point more of it at harder problems.
      </p>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat, ci) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: ci * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-4"
          >
            <div className="mb-3">
              <div className="text-[var(--color-text)] text-xs font-semibold uppercase tracking-[0.14em]">{cat.label}</div>
              <div className="text-[var(--color-text-ghost)] text-[10px] mt-0.5">{cat.blurb}</div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {cat.tools.map((tool, ti) => (
                <ToolTile key={tool.name} tool={tool} delay={ci * 0.06 + ti * 0.04} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ToolTile({ tool, delay }: { tool: Tool; delay: number }) {
  const brand = tool.icon ? BRAND_ICONS[tool.icon] : null

  return (
    <motion.div
      // gentle continuous float — staggered per tile
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: delay % 1 }}
      className="group/tile"
      title={tool.name}
    >
      <div className="flex flex-col items-center gap-1.5 w-[68px]">
        <div
          className="w-12 h-12 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-0)] flex items-center justify-center text-[var(--color-text-muted)] transition-all duration-300 group-hover/tile:-translate-y-1 group-hover/tile:border-[var(--color-brand)] group-hover/tile:text-[var(--color-brand)] group-hover/tile:shadow-[0_8px_24px_-8px_rgba(177,19,15,0.5)]"
        >
          {brand ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
              <path d={brand.path} />
            </svg>
          ) : (
            <span className="text-[15px] font-bold leading-none font-[family-name:var(--font-mono)] tracking-tight">
              {tool.mono}
            </span>
          )}
        </div>
        <span className="text-[var(--color-text-dim)] text-[9.5px] leading-tight text-center group-hover/tile:text-[var(--color-text-muted)] transition-colors">
          {tool.name}
        </span>
      </div>
    </motion.div>
  )
}
