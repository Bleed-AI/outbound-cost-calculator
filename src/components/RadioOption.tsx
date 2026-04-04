interface RadioOptionProps {
  name: string
  value: string
  label: string
  description?: string
  price?: string
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
}: RadioOptionProps) {
  return (
    <label
      className={`flex items-start gap-4 p-4 rounded-[var(--radius-inner)] cursor-pointer border transition-all duration-200 ease-[var(--ease-out-expo)] hover:scale-[1.005] active:scale-[0.995] ${
        disabled ? 'opacity-40 cursor-not-allowed hover:scale-100 active:scale-100' : ''
      } ${
        selected
          ? 'border-[var(--color-border-active)] bg-[var(--color-surface-2)] shadow-[0_0_0_1px_rgba(177,19,15,0.1)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-0)] hover:border-[var(--color-border-hover)]'
      }`}
    >
      {/* Radio indicator */}
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
            selected ? 'border-[var(--color-brand)]' : 'border-[var(--color-text-ghost)]'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full bg-[var(--color-brand)] transition-transform duration-200 ease-[var(--ease-spring)] ${
              selected ? 'scale-100' : 'scale-0'
            }`}
          />
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
    </label>
  )
}
