'use client'

import { motion } from 'framer-motion'

interface RadioOptionProps {
  name: string
  value: string
  label: string
  description?: string
  price?: string
  /** Stagger delay index for entrance animation (0-based). Omit for no stagger. */
  index?: number
  priceNote?: string
  strikePrice?: string
  badge?: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

export function RadioOption({
  name,
  value,
  label,
  description,
  price,
  priceNote,
  strikePrice,
  badge,
  selected,
  onSelect,
  disabled,
  index,
}: RadioOptionProps) {
  return (
    <motion.label
      initial={index !== undefined ? { opacity: 0, y: 12 } : undefined}
      animate={index !== undefined ? { opacity: 1, y: 0 } : undefined}
      transition={index !== undefined
        ? { type: 'spring', stiffness: 100, damping: 20, delay: (index ?? 0) * 0.06 }
        : { type: 'spring', stiffness: 400, damping: 30 }
      }
      whileHover={disabled ? undefined : { scale: 1.005 }}
      whileTap={disabled ? undefined : { scale: 0.995 }}
      className={`flex items-start gap-4 p-4 rounded-[var(--radius-inner)] cursor-pointer border transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${
        selected
          ? 'border-[var(--color-border-active)] bg-[var(--color-surface-2)] shadow-[0_0_0_1px_rgba(177,19,15,0.1)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-0)] hover:border-[var(--color-border-hover)]'
      }`}
      style={{ transitionDuration: 'var(--duration-normal)', transitionTimingFunction: 'var(--ease-out-expo)' }}
    >
      {/* Radio indicator */}
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'border-[var(--color-brand)]' : 'border-[var(--color-text-ghost)]'
          }`}
          style={{ transitionDuration: 'var(--duration-normal)' }}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="w-2 h-2 rounded-full bg-[var(--color-brand)]"
            />
          )}
        </div>
      </div>

      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-sm ${selected ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
            {label}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold bg-[var(--color-brand-muted)] text-[#e84040] border border-[rgba(177,19,15,0.2)] rounded-full px-2 py-0.5 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[var(--color-text-dim)] text-xs leading-relaxed mt-1">{description}</p>
        )}
      </div>

      {price !== undefined && (
        <div className="flex-shrink-0 text-right">
          {strikePrice && (
            <div className="text-[var(--color-text-ghost)] text-xs line-through">{strikePrice}</div>
          )}
          <div className={`font-semibold text-sm font-[family-name:var(--font-mono)] tabular-nums ${
            selected ? 'text-[#e84040]' : strikePrice ? 'text-[var(--color-success)]' : 'text-[var(--color-text-dim)]'
          }`}>
            {price}
          </div>
          {priceNote && <div className="text-[var(--color-text-ghost)] text-xs mt-0.5">{priceNote}</div>}
        </div>
      )}
    </motion.label>
  )
}
