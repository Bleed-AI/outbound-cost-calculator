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
    <div className="mt-3 rounded-[var(--radius-card)] border border-[var(--color-border-hover)] bg-[var(--color-bg)] p-4 space-y-4">
      <div className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">
        Month 1 — Timeline &amp; Delivery
      </div>

      {/* Timeline */}
      <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2.5 text-[11px] space-y-1">
        <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-16 flex-shrink-0">Day 1</span><span className="text-[var(--color-text-dim)]">Infrastructure setup</span></div>
        <div className="flex gap-2"><span className="text-[var(--color-text-ghost)] w-16 flex-shrink-0">Days 2–15</span><span className="text-[var(--color-text-dim)]">Provider inbox warmup — zero outbound sends</span></div>
        <div className="flex gap-2"><span className="text-[var(--color-brand)] w-16 flex-shrink-0">Days 16–29</span><span className="text-[var(--color-text-muted)]">Outbound ramp — <strong className="text-[var(--color-text)]">{month1ActualEmails.toLocaleString()} emails sent</strong></span></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
          <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Inboxes</div>
          <div className="text-[var(--color-text)] text-xl font-bold font-[family-name:var(--font-mono)] tabular-nums">{inboxesNeeded}</div>
          <div className="text-[var(--color-text-dim)] text-[11px]">across {domainsNeeded} domain{domainsNeeded !== 1 ? 's' : ''}</div>
        </div>

        <div className="rounded-[var(--radius-inner)] border border-[rgba(177,19,15,0.2)] bg-[var(--color-brand-muted)] p-3 space-y-1">
          <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Month 1 Sent</div>
          <div className="text-[var(--color-text)] text-xl font-bold font-[family-name:var(--font-mono)] tabular-nums">{month1ActualEmails.toLocaleString()}</div>
          <div className="text-[var(--color-brand)] text-[11px] font-medium">emails sent</div>
        </div>

        <div className="rounded-[var(--radius-inner)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-3 space-y-1">
          <div className="text-[var(--color-text-dim)] text-[10px] font-medium uppercase tracking-wider">Setup Fee</div>
          <div className="text-[var(--color-text)] text-xl font-bold font-[family-name:var(--font-mono)] tabular-nums">{fmtUSD(setupFee)}</div>
          <div className="text-[var(--color-text-dim)] text-[11px]">one-time</div>
        </div>
      </div>

      <p className="text-[var(--color-text-ghost)] text-[11px] italic">
        Month 1 billing is based on emails sent during the 14-day ramp phase only. Full sending capacity begins from month 2.
      </p>
    </div>
  )
}
