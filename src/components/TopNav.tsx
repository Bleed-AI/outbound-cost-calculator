'use client'

const NAV_ITEMS: { label: string; href: string; id: 'calculator' | 'trials' | 'packages' }[] = [
  { label: 'Calculator', href: '/', id: 'calculator' },
  { label: 'Trials', href: '/trials', id: 'trials' },
  { label: 'Packages', href: '/packages', id: 'packages' },
]

interface TopNavProps {
  current: 'calculator' | 'trials' | 'packages'
}

export function TopNav({ current }: TopNavProps) {
  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {NAV_ITEMS.map((item) => {
        const active = item.id === current
        return (
          <a
            key={item.id}
            href={item.href}
            className={`relative px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-tight transition-all ${
              active
                ? 'text-[var(--color-text)] bg-[var(--color-brand-muted)] border border-[rgba(177,19,15,0.3)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] border border-transparent hover:border-[var(--color-border-hover)]'
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-brand)]" />
            )}
          </a>
        )
      })}
    </nav>
  )
}
