'use client'

// Drop campaign result screenshots into /public/campaign-results/
// Filenames are picked up automatically — add as many as you like.
const PLACEHOLDER_IMAGES: { label: string; color: string }[] = [
  { label: 'SaaS Campaign — 4.2% Reply Rate', color: '#1a1a2e' },
  { label: 'Agency Outreach — 38 Meetings Booked', color: '#16213e' },
  { label: 'E-Commerce B2B — $180k Pipeline', color: '#0f3460' },
  { label: 'Recruiting Firm — 22% Open Rate', color: '#1a1a2e' },
]

interface ResultsGalleryProps {
  // Pass image paths once available, e.g. ['/campaign-results/result1.png', ...]
  images?: string[]
}

export function ResultsGallery({ images }: ResultsGalleryProps) {
  const hasImages = images && images.length > 0

  return (
    <section className="border-b border-white/8 bg-[#050508] py-5">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-3">
          Typical Campaign Results
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {hasImages
            ? images.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg overflow-hidden border border-white/10 hover:border-[#B1130F]/50 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Campaign result ${i + 1}`}
                    className="h-28 w-auto object-cover"
                  />
                </a>
              ))
            : PLACEHOLDER_IMAGES.map((item, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-28 w-48 rounded-lg border border-white/8 flex items-end p-3"
                  style={{ background: item.color }}
                >
                  <span className="text-white/60 text-xs leading-tight">{item.label}</span>
                </div>
              ))}
        </div>
        {!hasImages && (
          <p className="text-gray-600 text-xs mt-2">
            📸 Add your campaign screenshots to{' '}
            <code className="text-gray-500">public/campaign-results/</code>
          </p>
        )}
      </div>
    </section>
  )
}
