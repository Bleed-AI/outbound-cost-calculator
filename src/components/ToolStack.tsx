'use client'

import { useState } from 'react'

/**
 * Compact tool-stack showcase. Five category groups laid out as a 3-then-2
 * grid (headings on top of each group, not a left column) so it stays short
 * and the pricing cards sit high on the page. Real colour logos live in
 * /public/logos; a text-initial fallback renders if an image is missing.
 */

export type Tool = { name: string; logo?: string; glyph?: 'directory' }
type Category = { label: string; tools: Tool[] }

const CATEGORIES: Category[] = [
  {
    label: 'Sourcing',
    tools: [
      { name: 'LinkedIn Sales Nav', logo: 'linkedin' },
      { name: 'Google Maps', logo: 'googlemaps' },
      { name: 'Apollo', logo: 'apollo' },
      { name: 'Apify', logo: 'apify' },
      { name: 'Niche Directories', glyph: 'directory' },
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
    label: 'Orchestration, Signals & AI',
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
      { name: 'ZapMail', logo: 'zapmail' },
      { name: 'Google Workspace', logo: 'gmail' },
      { name: 'Microsoft', logo: 'outlook' },
      { name: 'Supabase', logo: 'supabase' },
    ],
  },
]

export function ToolStack() {
  return (
    <section aria-label="Our tool stack">
      <div className="flex items-baseline gap-2.5 mb-5">
        <span className="h-px w-6 bg-[var(--color-brand)]" />
        <h3 className="text-[var(--color-text-muted)] text-[11px] font-semibold uppercase tracking-[0.18em]">The machine we run for you</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-ghost)] mb-2.5">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.tools.map((tool) => (
                <ToolChip key={tool.name} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ToolChip({ tool }: { tool: Tool }) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      title={tool.name}
      className="group/chip relative inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-white ring-1 ring-inset ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.55)] cursor-default"
    >
      {tool.glyph === 'directory' ? (
        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h18M3 12h18M3 17h10" />
        </svg>
      ) : failed ? (
        <span className="text-[10px] font-bold text-gray-600 leading-none">
          {tool.name.replace(/[^A-Za-z]/g, '').slice(0, 2)}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/logos/${tool.logo}.png`}
          alt={tool.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-[19px] w-[19px] object-contain"
        />
      )}
      <span className="pointer-events-none absolute -bottom-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-surface-0)] px-2 py-1 text-[9px] text-[var(--color-text-muted)] ring-1 ring-white/10 opacity-0 group-hover/chip:opacity-100 transition-opacity z-20">
        {tool.name}
      </span>
    </span>
  )
}
