interface SectionCardProps {
  title: string
  description?: string
  optional?: boolean
  children: React.ReactNode
}

export function SectionCard({ title, description, optional, children }: SectionCardProps) {
  return (
    <div className="relative bg-[#0d0d14] border border-white/8 rounded-xl overflow-hidden">
      {/* Crimson left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B1130F]" />

      <div className="px-6 py-5 pl-8">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          {optional && (
            <span className="text-[11px] font-medium text-gray-500 border border-white/10 rounded-full px-2.5 py-0.5 tracking-wide">
              OPTIONAL
            </span>
          )}
        </div>
        {description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
        )}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
