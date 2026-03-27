'use client'

function fmtUSD(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString()}` : `$${n.toFixed(2)}`
}

interface WarmupInfoPanelProps {
  inboxesNeeded: number
  domainsNeeded: number
  month1ActualEmails: number
  setupFee: number
}

export function WarmupInfoPanel({ inboxesNeeded, domainsNeeded, month1ActualEmails, setupFee }: WarmupInfoPanelProps) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-[#050508] p-4 space-y-4">
      <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
        Month 1 — Timeline &amp; Delivery
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-white/8 bg-[#0c0c12] px-3 py-2.5 text-[11px] space-y-1">
        <div className="flex gap-2"><span className="text-gray-600 w-16 flex-shrink-0">Day 1</span><span className="text-gray-500">Infrastructure setup</span></div>
        <div className="flex gap-2"><span className="text-gray-600 w-16 flex-shrink-0">Days 2–15</span><span className="text-gray-500">Provider inbox warmup — zero outbound sends</span></div>
        <div className="flex gap-2"><span className="text-[#e84040] w-16 flex-shrink-0">Days 16–29</span><span className="text-gray-400">Outbound ramp — <strong className="text-white">{month1ActualEmails.toLocaleString()} emails sent</strong></span></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Inboxes</div>
          <div className="text-white text-xl font-bold tabular-nums">{inboxesNeeded}</div>
          <div className="text-gray-500 text-[11px]">across {domainsNeeded} domain{domainsNeeded !== 1 ? 's' : ''}</div>
        </div>

        <div className="rounded-lg border border-[#B1130F]/30 bg-[#B1130F]/5 p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Month 1 Sent</div>
          <div className="text-white text-xl font-bold tabular-nums">{month1ActualEmails.toLocaleString()}</div>
          <div className="text-[#e84040] text-[11px] font-medium">emails sent</div>
        </div>

        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Setup Fee</div>
          <div className="text-white text-xl font-bold tabular-nums">{fmtUSD(setupFee)}</div>
          <div className="text-gray-500 text-[11px]">one-time</div>
        </div>
      </div>

      <p className="text-gray-600 text-[11px] italic">
        Month 1 billing is based on emails sent during the 14-day ramp phase only. Full sending capacity begins from month 2.
      </p>
    </div>
  )
}
