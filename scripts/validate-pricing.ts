// Pricing validation harness — sanity-check the engine across edge cases.
// Run: npx tsx scripts/validate-pricing.ts

import { calculateTotal, DEFAULT_STATE, COUPON_CODES } from '../src/lib/pricing'
import { PRICING } from '../src/lib/pricing.config'
import { parseState } from '../src/lib/url-state'
import type { SelectionState } from '../src/lib/types'

const fmt = (n: number) => `$${n.toFixed(2).padStart(10, ' ')}`

function fix(state: SelectionState, overrides: Partial<SelectionState> = {}): SelectionState {
  return {
    ...state,
    ...overrides,
    addOns: { ...state.addOns, ...(overrides.addOns ?? {}) },
  }
}

const cases: { name: string; state: SelectionState }[] = [
  { name: 'Floor: 1.5k leads, 1 EPP, 1 campaign', state: fix(DEFAULT_STATE, { leadsPerMonth: 1500, emailsPerProspect: 1, campaigns: 1 }) },
  { name: 'Default state (4k×2, 1 campaign)', state: DEFAULT_STATE },
  { name: '4k leads, 2 EPP, 2 campaigns', state: fix(DEFAULT_STATE, { leadsPerMonth: 4000, emailsPerProspect: 2, campaigns: 2 }) },
  { name: '4k leads, 2 EPP, 5 campaigns', state: fix(DEFAULT_STATE, { leadsPerMonth: 4000, emailsPerProspect: 2, campaigns: 5 }) },
  { name: '10k leads, 2 EPP, 1 campaign', state: fix(DEFAULT_STATE, { leadsPerMonth: 10000, emailsPerProspect: 2, campaigns: 1 }) },
  { name: '10k leads, 3 EPP, 3 campaigns', state: fix(DEFAULT_STATE, { leadsPerMonth: 10000, emailsPerProspect: 3, campaigns: 3 }) },
  { name: '20k leads, 2 EPP, 1 campaign — should cross nudge', state: fix(DEFAULT_STATE, { leadsPerMonth: 20000, emailsPerProspect: 2, campaigns: 1 }) },
  { name: 'Ceiling: 40k leads, 3 EPP, 5 campaigns', state: fix(DEFAULT_STATE, { leadsPerMonth: 40000, emailsPerProspect: 3, campaigns: 5 }) },
  { name: '10k leads w/ VIP15 coupon', state: fix(DEFAULT_STATE, { leadsPerMonth: 10000, coupon: 'VIP15' }) },
  { name: '10k leads w/ DIAMOND33 coupon', state: fix(DEFAULT_STATE, { leadsPerMonth: 10000, coupon: 'DIAMOND33' }) },
]

console.log('\nNUDGE THRESHOLD:', fmt(PRICING.packageNudgeThreshold))
console.log('PRICE PER ADDITIONAL EXPERIMENT:', fmt(PRICING.pricePerAdditionalExperiment))
console.log('CAPACITY: 27 emails/inbox/day · 2wk warmup + 4wk send (6wk) · 3 inboxes/domain · +1 backup domain / 5k emails')
console.log('\nPricing scenarios:\n')
console.log(['Case'.padEnd(46), 'Total'.padStart(11), 'Infra'.padStart(9), 'Nudge'.padStart(6), 'Sends'.padStart(7), 'Inbox/Dom'.padStart(10)].join('  '))
console.log('─'.repeat(100))

for (const { name, state } of cases) {
  const result = calculateTotal(state)
  const nudge = result.total >= PRICING.packageNudgeThreshold ? 'YES' : '—'
  console.log([
    name.padEnd(46),
    fmt(result.total),
    fmt(result.infraIncludedCost),
    nudge.padStart(6),
    String(result.totalEmails).padStart(7),
    `${result.inboxesNeeded ?? 0}/${result.domainsNeeded ?? 0}`.padStart(10),
  ].join('  '))
}

console.log('\n── Campaign experiment price check (each adds $125) ──')
for (let n = 1; n <= 5; n++) {
  const r = calculateTotal(fix(DEFAULT_STATE, { campaigns: n as 1 | 2 | 3 | 4 | 5 }))
  const campaignItem = r.lineItems.find((i) => i.label.includes('Campaign Experiment'))
  const campaignCost = campaignItem ? campaignItem.amount : 0
  const expected = (n - 1) * 125
  const match = campaignCost === expected ? '✓' : '✗ EXPECTED ' + expected
  console.log(`  ${n} experiment(s): line item = ${fmt(campaignCost)} ${match}`)
}

console.log('\n── Coupon math sanity (coupons apply to services only — NOT the included infra) ──')
for (const code of ['NEW5', 'SPECIAL10', 'VIP15', 'ULTRA20', 'PLATINUM25', 'DIAMOND33']) {
  const noCoupon = calculateTotal(fix(DEFAULT_STATE, { leadsPerMonth: 10000 }))
  const withCoupon = calculateTotal(fix(DEFAULT_STATE, { leadsPerMonth: 10000, coupon: code }))
  const pct = COUPON_CODES[code]
  // Couponable base excludes the non-discounted infra-included cost.
  const couponableBase = noCoupon.total - noCoupon.infraIncludedCost
  const expectedDiscount = Math.round((couponableBase * pct / 100) * 100) / 100
  const ok = Math.abs(withCoupon.couponDiscountAmount - expectedDiscount) < 0.02 ? '✓' : '✗'
  console.log(`  ${ok} ${code} (${pct}%): pre=${fmt(noCoupon.total)} post=${fmt(withCoupon.total)} discount=${fmt(withCoupon.couponDiscountAmount)} expected≈${fmt(expectedDiscount)}`)
}

// URL state backward compatibility
console.log('\n── URL state backward compat (legacy params) ──')

function makeParams(obj: Record<string, string>) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) p.set(k, v)
  return p
}

const legacyCases: { name: string; params: Record<string, string> }[] = [
  { name: 'Old full_dfy + branded link', params: { s: 'full_dfy', i: 'user_domains', l: '4000' } },
  { name: 'Old user_domains_instantly inbox', params: { i: 'user_domains_instantly', l: '7500' } },
  { name: 'Old support tier slack_full', params: { su: 'slack_full', l: '4000' } },
  { name: 'Old LinkedIn + CRM addons', params: { li: '1', cr: '1', l: '4000' } },
  { name: 'Old campaigns=3 (still valid)', params: { ca: '3', l: '4000' } },
  { name: 'Coupon-only URL', params: { cp: 'VIP15' } },
]

for (const { name, params } of legacyCases) {
  try {
    const state = parseState(makeParams(params))
    const r = calculateTotal(state)
    console.log(`  ✓ ${name.padEnd(40)} → leads=${state.leadsPerMonth} total=${fmt(r.total)}`)
  } catch (err) {
    console.log(`  ✗ ${name.padEnd(40)} → THREW: ${err instanceof Error ? err.message : err}`)
  }
}
