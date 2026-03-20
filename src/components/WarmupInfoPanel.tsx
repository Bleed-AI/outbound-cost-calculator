'use client'

function fmtUSD(n: number): string {
  return n % 1 === 0 ? `$${n.toLocaleString()}` : `$${n.toFixed(2)}`
}

interface WarmupInfoPanelProps {
  inboxesNeeded: number
  domainsNeeded: number
  month1Estimate: number
  setupBase: number
  setupFinal: number
}

export function WarmupInfoPanel({ inboxesNeeded, domainsNeeded, month1Estimate, setupBase, setupFinal }: WarmupInfoPanelProps) {
  const discount = setupBase - setupFinal
  const isWaived = setupFinal === 0

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-[#050508] p-4 space-y-4">
      <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
        Deliverability &amp; Setup Breakdown
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Inboxes */}
        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Inboxes</div>
          <div className="text-white text-xl font-bold tabular-nums">{inboxesNeeded}</div>
          <div className="text-gray-500 text-[11px]">across {domainsNeeded} domain{domainsNeeded !== 1 ? 's' : ''}</div>
        </div>

        {/* Month 1 estimate */}
        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Month 1 Est.</div>
          <div className="text-white text-xl font-bold tabular-nums">{month1Estimate.toLocaleString()}</div>
          <div className="text-gray-500 text-[11px]">emails (ramp period)</div>
        </div>

        {/* Setup fee */}
        <div className="rounded-lg border border-white/8 bg-[#0c0c12] p-3 space-y-1">
          <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Setup Fee</div>
          {isWaived ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-600 text-lg line-through tabular-nums">{fmtUSD(setupBase)}</span>
                <span className="text-green-400 text-sm font-semibold">$0</span>
              </div>
              <div className="text-green-500/70 text-[11px] font-medium">Waived</div>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                {discount > 0 && (
                  <span className="text-gray-600 text-sm line-through tabular-nums">{fmtUSD(setupBase)}</span>
                )}
                <span className="text-white text-xl font-bold tabular-nums">{fmtUSD(setupFinal)}</span>
              </div>
              {discount > 0 && (
                <div className="text-green-500/70 text-[11px]">-{fmtUSD(discount)} discount</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-gray-600 text-[11px] italic">
        Your pricing reflects full monthly capacity. The setup discount offsets reduced month 1 sending.
      </p>
    </div>
  )
}
