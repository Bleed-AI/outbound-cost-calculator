'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Compact, categorized showcase of the real tools BleedAI operates — small
 * logo chips in tight rows so the whole stack sits ABOVE the pricing cards and
 * everything stays visible on load. Real brand logos live in /public/logos;
 * a monogram fallback renders if an image is missing.
 */

type Tool = { name: string; logo?: string; mono?: string }
type Category = { label: string; tools: Tool[] }

const CATEGORIES: Category[] = [
  {
    label: 'Sourcing',
    tools: [
      { name: 'LinkedIn Sales Nav', logo: 'linkedin' },
      { name: 'Google Maps', logo: 'googlemaps' },
      { name: 'Apollo', logo: 'apollo' },
      { name: 'Apify', logo: 'apify' },
      { name: 'Niche Directories', mono: '☰' },
    ],
  },
  {
    label: 'Email Finding',
    tools: [
      { name: 'Prospeo', logo: 'prospeo' },
      { name: 'TryKit', logo: 'trykit' },
      { name: 'LeadMagic', logo: 'leadmagic' },
      { name: 'FindyMail', logo: 'findymail' },
    ],
  },
  {
    label: 'Enrichment',
    tools: [
      { name: 'Parallel.ai', logo: 'parallel' },
      { name: 'Serper', logo: 'serper' },
      { name: 'OpenWebNinja', logo: 'openwebninja' },
    ],
  },
  {
    label: 'Orchestration & AI',
    tools: [
      { name: 'Clay', logo: 'clay' },
      { name: 'Claude Code', logo: 'claude' },
      { name: 'OpenAI', logo: 'openai' },
      { name: 'n8n', logo: 'n8n' },
    ],
  },
  {
    label: 'Sending & Infra',
    tools: [
      { name: 'Instantly', logo: 'instantly' },
      { name: 'Supabase', logo: 'supabase' },
      { name: 'Cloudflare', logo: 'cloudflare' },
    ],
  },
]

export function ToolStack() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)]/60 px-4 py-3.5"
    >
      <div className="flex items-baseline gap-2.5 mb-3">
        <span className="h-px w-5 bg-[var(--color-brand)]" />
        <h3 className="text-[var(--color-text)] text-xs font-semibold tracking-tight">The machine we run for you</h3>
        <span className="hidden sm:inline text-[var(--color-text-ghost)] text-[10.5px]">— every tier runs the full stack; higher tiers point more of it at harder problems</span>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <div className="sm:w-[124px] shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-text-dim)]">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.tools.map((tool, i) => (
                <ToolChip key={tool.name} tool={tool} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ToolChip({ tool, index }: { tool: Tool; index: number }) {
  const [failed, setFailed] = useState(false)
  const showMono = !tool.logo || failed
  const mono = tool.mono ?? tool.name.slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      title={tool.name}
      className="group/chip relative w-8 h-8 rounded-[9px] bg-white border border-black/[0.06] flex items-center justify-center overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)] cursor-default"
    >
      {showMono ? (
        <span className="text-[11px] font-bold text-gray-700 leading-none">{mono}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/logos/${tool.logo}.png`}
          alt={tool.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain p-[5px]"
        />
      )}
      {/* tooltip */}
      <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-surface-0)] border border-[var(--color-border)] px-1.5 py-0.5 text-[9px] text-[var(--color-text-muted)] opacity-0 group-hover/chip:opacity-100 transition-opacity z-10">
        {tool.name}
      </span>
    </motion.div>
  )
}
