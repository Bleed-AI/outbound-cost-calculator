/** Abstract geometric SVG illustrations for each calculator section.
 *  Style: architectural wireframes, crimson + grayscale on transparent, low-poly aesthetic.
 *  All are 120x120 viewBox, rendered at ~80px on desktop, hidden on mobile.
 */

const brandColor = 'var(--color-brand)'
const dimColor = 'var(--color-text-ghost)'
const mutedColor = 'var(--color-text-dim)'

export function CampaignSetupIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Interconnected email envelopes launching from platform */}
      <rect x="20" y="70" width="80" height="4" rx="2" fill={dimColor} opacity="0.3" />
      <path d="M30 65 L50 45 L70 65" stroke={brandColor} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M50 55 L70 35 L90 55" stroke={brandColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      <rect x="35" y="50" width="30" height="20" rx="2" stroke={mutedColor} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M35 50 L50 62 L65 50" stroke={mutedColor} strokeWidth="1" fill="none" opacity="0.5" />
      <rect x="55" y="30" width="30" height="20" rx="2" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M55 30 L70 42 L85 30" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.6" />
      {/* Connection lines */}
      <line x1="50" y1="55" x2="70" y2="42" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      {/* Particles */}
      <circle cx="45" cy="40" r="1.5" fill={brandColor} opacity="0.5" />
      <circle cx="80" cy="25" r="1" fill={brandColor} opacity="0.3" />
      <circle cx="25" cy="55" r="1" fill={mutedColor} opacity="0.3" />
    </svg>
  )
}

export function CampaignVolumeIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ascending volume bars with particle trails */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const h = 15 + i * 8
        const x = 20 + i * 12
        const isHighlighted = i >= 4
        return (
          <g key={i}>
            <rect
              x={x} y={80 - h} width="8" height={h} rx="2"
              fill={isHighlighted ? brandColor : mutedColor}
              opacity={isHighlighted ? 0.4 + i * 0.05 : 0.15}
            />
            {isHighlighted && (
              <circle cx={x + 4} cy={80 - h - 5} r="1.5" fill={brandColor} opacity="0.5" />
            )}
          </g>
        )
      })}
      {/* Curve line */}
      <path d="M24 65 C40 55, 60 40, 88 25" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="3 2" />
      {/* Base line */}
      <line x1="15" y1="82" x2="105" y2="82" stroke={dimColor} strokeWidth="0.5" opacity="0.2" />
    </svg>
  )
}

export function LeadDataIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Network graph with data nodes */}
      <circle cx="60" cy="55" r="12" stroke={brandColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="60" cy="55" r="4" fill={brandColor} opacity="0.3" />
      {/* Orbiting nodes */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const cx = 60 + Math.cos(rad) * 30
        const cy = 55 + Math.sin(rad) * 25
        return (
          <g key={i}>
            <line x1="60" y1="55" x2={cx} y2={cy} stroke={dimColor} strokeWidth="0.5" opacity="0.2" />
            <circle cx={cx} cy={cy} r={i % 2 === 0 ? 3 : 2} stroke={i < 2 ? brandColor : mutedColor} strokeWidth="1" fill="none" opacity={0.3 + i * 0.05} />
          </g>
        )
      })}
      {/* Filter / magnifying glass */}
      <circle cx="60" cy="55" r="20" stroke={mutedColor} strokeWidth="0.5" fill="none" opacity="0.15" strokeDasharray="4 3" />
    </svg>
  )
}

export function EnrichmentsIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Overlapping translucent planes — data refinement */}
      <rect x="25" y="30" width="50" height="35" rx="3" stroke={dimColor} strokeWidth="0.8" fill="none" opacity="0.2" transform="rotate(-5 50 47)" />
      <rect x="35" y="40" width="50" height="35" rx="3" stroke={mutedColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      <rect x="45" y="50" width="50" height="35" rx="3" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.4" />
      {/* Data dots filtering through */}
      <circle cx="55" cy="45" r="1.5" fill={dimColor} opacity="0.3" />
      <circle cx="65" cy="52" r="1.5" fill={mutedColor} opacity="0.4" />
      <circle cx="70" cy="60" r="2" fill={brandColor} opacity="0.5" />
      <circle cx="78" cy="68" r="2" fill={brandColor} opacity="0.4" />
      {/* Arrow down */}
      <path d="M70 75 L70 85 L66 81 M70 85 L74 81" stroke={brandColor} strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function CopywritingIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document with A/B split */}
      <rect x="30" y="25" width="60" height="70" rx="4" stroke={mutedColor} strokeWidth="1" fill="none" opacity="0.3" />
      {/* Text lines */}
      <rect x="38" y="35" width="44" height="2" rx="1" fill={dimColor} opacity="0.3" />
      <rect x="38" y="42" width="36" height="2" rx="1" fill={dimColor} opacity="0.2" />
      <rect x="38" y="49" width="40" height="2" rx="1" fill={dimColor} opacity="0.2" />
      {/* Split line */}
      <line x1="60" y1="58" x2="60" y2="85" stroke={brandColor} strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
      {/* A side */}
      <text x="45" y="68" fontSize="8" fill={mutedColor} opacity="0.4" fontFamily="var(--font-mono)">A</text>
      <rect x="38" y="72" width="18" height="2" rx="1" fill={mutedColor} opacity="0.2" />
      <rect x="38" y="78" width="14" height="2" rx="1" fill={mutedColor} opacity="0.15" />
      {/* B side */}
      <text x="69" y="68" fontSize="8" fill={brandColor} opacity="0.5" fontFamily="var(--font-mono)">B</text>
      <rect x="64" y="72" width="18" height="2" rx="1" fill={brandColor} opacity="0.3" />
      <rect x="64" y="78" width="14" height="2" rx="1" fill={brandColor} opacity="0.2" />
    </svg>
  )
}

export function ReplyHandlingIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* AI routing node with conversation bubbles */}
      <circle cx="60" cy="50" r="10" stroke={brandColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="60" cy="50" r="3" fill={brandColor} opacity="0.3" />
      {/* Incoming bubbles */}
      <rect x="20" y="35" width="20" height="12" rx="6" stroke={dimColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      <rect x="15" y="55" width="22" height="12" rx="6" stroke={dimColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      {/* Routing lines */}
      <path d="M40 41 L50 47" stroke={dimColor} strokeWidth="0.8" opacity="0.3" />
      <path d="M37 61 L50 54" stroke={dimColor} strokeWidth="0.8" opacity="0.25" />
      {/* Outgoing sorted channels */}
      <path d="M70 45 L90 35" stroke={brandColor} strokeWidth="0.8" opacity="0.4" />
      <path d="M70 50 L95 50" stroke={brandColor} strokeWidth="0.8" opacity="0.35" />
      <path d="M70 55 L90 65" stroke={brandColor} strokeWidth="0.8" opacity="0.3" />
      {/* Channel endpoints */}
      <rect x="88" y="30" width="16" height="10" rx="2" stroke={brandColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      <rect x="93" y="45" width="16" height="10" rx="2" stroke={brandColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      <rect x="88" y="60" width="16" height="10" rx="2" stroke={brandColor} strokeWidth="0.8" fill="none" opacity="0.2" />
    </svg>
  )
}

export function SupportIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Headset wireframe with signal waves */}
      <path d="M40 60 C40 40, 80 40, 80 60" stroke={mutedColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      <rect x="35" y="58" width="10" height="16" rx="5" stroke={mutedColor} strokeWidth="1" fill="none" opacity="0.35" />
      <rect x="75" y="58" width="10" height="16" rx="5" stroke={mutedColor} strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M45 74 C45 80, 55 82, 60 82" stroke={dimColor} strokeWidth="0.8" fill="none" opacity="0.25" />
      {/* Signal waves */}
      <path d="M88 50 C92 45, 92 55, 96 50" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M94 50 C98 43, 98 57, 102 50" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.2" />
      <path d="M24 50 C20 45, 20 55, 16 50" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M18 50 C14 43, 14 57, 10 50" stroke={brandColor} strokeWidth="1" fill="none" opacity="0.2" />
    </svg>
  )
}

export function AddOnsIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Modular blocks that snap together */}
      <rect x="25" y="45" width="22" height="22" rx="3" stroke={dimColor} strokeWidth="1" fill="none" opacity="0.3" />
      <rect x="49" y="45" width="22" height="22" rx="3" stroke={mutedColor} strokeWidth="1" fill="none" opacity="0.35" />
      <rect x="73" y="45" width="22" height="22" rx="3" stroke={brandColor} strokeWidth="1.2" fill="none" opacity="0.4" />
      {/* Connectors */}
      <circle cx="47" cy="56" r="2" fill={dimColor} opacity="0.3" />
      <circle cx="71" cy="56" r="2" fill={mutedColor} opacity="0.35" />
      {/* Plus signs */}
      <line x1="84" y1="52" x2="84" y2="60" stroke={brandColor} strokeWidth="1.2" opacity="0.4" />
      <line x1="80" y1="56" x2="88" y2="56" stroke={brandColor} strokeWidth="1.2" opacity="0.4" />
      {/* Bottom connector blocks */}
      <rect x="37" y="69" width="22" height="22" rx="3" stroke={dimColor} strokeWidth="1" fill="none" opacity="0.2" strokeDasharray="3 2" />
      <rect x="61" y="69" width="22" height="22" rx="3" stroke={dimColor} strokeWidth="1" fill="none" opacity="0.15" strokeDasharray="3 2" />
    </svg>
  )
}

export function CostBreakdownIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stacked horizontal bars converging to total */}
      {[0, 1, 2, 3, 4].map((i) => {
        const w = 50 - i * 6
        const y = 30 + i * 12
        return (
          <rect key={i} x={35} y={y} width={w} height={6} rx="3"
            fill={i === 4 ? brandColor : mutedColor}
            opacity={i === 4 ? 0.5 : 0.1 + i * 0.05}
          />
        )
      })}
      {/* Convergence lines */}
      <path d="M85 33 L95 55 L85 77" stroke={dimColor} strokeWidth="0.5" fill="none" opacity="0.2" />
      {/* Total circle */}
      <circle cx="95" cy="55" r="8" stroke={brandColor} strokeWidth="1.5" fill="none" opacity="0.4" />
      <text x="95" y="58" fontSize="6" fill={brandColor} opacity="0.5" textAnchor="middle" fontFamily="var(--font-mono)">$</text>
    </svg>
  )
}
