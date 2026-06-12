'use client'

import { useState } from 'react'

/**
 * Compact, premium tool-stack strip. Logos render muted (grayscale, low
 * opacity) so the row reads as one cohesive material, then bloom into full
 * colour on hover. No app-icon tiles, no big competing panel — just tight
 * categorised rows that sit above the pricing cards. Real logos live in
 * /public/logos; a text-initial fallback renders if an image is missing.
 */

type Tool = { name: string; logo?: string; glyph?: 'directory' }
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
    <section aria-label="Our tool stack">
      <div className="flex items-baseline gap-2.5 mb-4">
        <span className="h-px w-6 bg-[var(--color-brand)]" />
        <h3 className="text-[var(--color-text-muted)] text-[11px] font-semibold uppercase tracking-[0.18em]">The machine we run for you</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-5 gap-y-3.5">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="contents">
            <div className="self-center text-[9.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-text-ghost)]">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-2 pb-2.5 sm:pb-3.5 border-b border-[var(--color-border)]/60">
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

function ToolChip({ tool }: { tool: Tool }) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      title={tool.name}
      className="group/chip relative inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#ececed] ring-1 ring-inset ring-black/[0.08] transition-all duration-200 hover:-translate-y-[3px] hover:bg-white hover:ring-black/15 cursor-default"
    >
      {tool.glyph === 'directory' ? (
        <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="h-[18px] w-[18px] object-contain grayscale opacity-85 transition-all duration-300 group-hover/chip:grayscale-0 group-hover/chip:opacity-100"
        />
      )}
      <span className="pointer-events-none absolute -bottom-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-surface-0)] px-2 py-1 text-[9px] text-[var(--color-text-muted)] ring-1 ring-white/10 opacity-0 group-hover/chip:opacity-100 transition-opacity z-20">
        {tool.name}
      </span>
    </span>
  )
}
