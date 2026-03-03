export function Header() {
  return (
    <header className="border-b border-white/8 bg-[#050508]">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bleed-ai-logo.svg" alt="BleedAI" className="h-7 w-auto" />
        <div className="w-px h-5 bg-white/15" />
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">
            Cold Outreach Campaign Builder
          </h1>
          <p className="text-gray-500 text-xs">Configure your campaign and get an instant price</p>
        </div>
      </div>
    </header>
  )
}
