interface RadioOptionProps {
  name: string
  value: string
  label: string
  description?: string
  price?: string
  priceNote?: string
  strikePrice?: string  // original price to show with strikethrough when item is free/included
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
      className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer border transition-all duration-150 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/20'
      } ${
        selected
          ? 'border-[#B1130F] bg-[#B1130F]/8'
          : 'border-white/8 bg-[#050508]'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'border-[#B1130F]' : 'border-gray-600'
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-[#B1130F]" />}
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
          <span className={`font-medium text-sm ${selected ? 'text-white' : 'text-gray-300'}`}>
            {label}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold bg-[#B1130F]/20 text-[#e84040] border border-[#B1130F]/30 rounded-full px-2 py-0.5 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-gray-500 text-xs leading-relaxed mt-1">{description}</p>
        )}
      </div>

      {price !== undefined && (
        <div className="flex-shrink-0 text-right">
          {strikePrice && (
            <div className="text-gray-600 text-xs line-through">{strikePrice}</div>
          )}
          <div className={`font-semibold text-sm ${selected ? 'text-[#e84040]' : strikePrice ? 'text-green-400' : 'text-gray-400'}`}>
            {price}
          </div>
          {priceNote && <div className="text-gray-600 text-xs mt-0.5">{priceNote}</div>}
        </div>
      )}
    </label>
  )
}
