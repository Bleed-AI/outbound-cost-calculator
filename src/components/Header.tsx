export function Header() {
  return (
    <header className="bg-[#050508] border-b border-white/8">
      {/* Top nav bar */}
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <a href="https://bleedai.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bleed-ai-logo.svg" alt="BleedAI" className="h-8 w-auto" />
        </a>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pb-8 pt-4">
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">
          Cold Outreach{' '}
          <span className="text-[#B1130F]">Cost</span> Calculator
        </h1>
        <p className="text-gray-400 text-base mt-2">
          Configure your campaign below and get an instant price.
        </p>
      </div>
    </header>
  )
}
