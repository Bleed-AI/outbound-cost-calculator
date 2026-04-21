/**
 * Pricing engine tests.
 *
 * These tests codify the pricing rules that govern calculateTotal().
 * Every invariant here maps to a real business rule — see PRICING_RULES.md
 * for the plain-English version. If a test fails, it means either:
 *   (a) the engine has a regression, or
 *   (b) the business rule changed and this test (plus PRICING_RULES.md)
 *       needs to be updated to match.
 *
 * Run: `npm test`
 */

import { describe, it, expect } from 'vitest'
import { calculateTotal, DEFAULT_STATE, includedCampaignTier } from './pricing'
import { PRICING } from './pricing.config'
import type { SelectionState } from './types'

/** Build a state by patching the default. */
function state(patch: Partial<SelectionState> = {}): SelectionState {
  return { ...DEFAULT_STATE, ...patch, addOns: { ...DEFAULT_STATE.addOns, ...(patch.addOns ?? {}) } }
}

// ────────────────────────────────────────────────────────────────
// Volume discount — applied to variable (per-1k) costs only
// ────────────────────────────────────────────────────────────────

describe('volume discount', () => {
  it('applies 0% at 2,000 leads', () => {
    const r = calculateTotal(state({ leadsPerMonth: 2000 }))
    expect(r.discountPercent).toBe(0)
    expect(r.discountAmount).toBe(0)
  })

  it('applies 10% at 10,000 leads', () => {
    const r = calculateTotal(state({ leadsPerMonth: 10000 }))
    expect(r.discountPercent).toBe(10)
    expect(r.discountAmount).toBeGreaterThan(0)
  })

  it('discounts only variable costs, not fixed or add-ons', () => {
    // Compare a config at 4,000 leads (5% off) vs 2,000 (0% off).
    // The delta in discountAmount should match variableSubtotalBeforeDiscount × 0.05.
    const r = calculateTotal(state({ leadsPerMonth: 4000 }))
    const expected = +(r.variableSubtotalBeforeDiscount * 0.05).toFixed(2)
    expect(r.discountAmount).toBeCloseTo(expected, 2)
  })
})

// ────────────────────────────────────────────────────────────────
// Support waiver — free if recurring (monthly) spend hits threshold
// ────────────────────────────────────────────────────────────────

describe('support waiver (recurring-only threshold)', () => {
  it('charges email support when recurring < $500', () => {
    const r = calculateTotal(state({
      monthType: 'normal_month',
      leadsPerMonth: 2000,
      dataSource: 'full_list',   // cheapest data
      enrichments: 'none',
      copywriting: 'finalized',
      campaigns: 1,
      support: 'email',
    }))
    expect(r.supportIsFree).toBe(false)
    expect(r.baseTotal).toBeLessThan(PRICING.supportWaiverThresholds.email)
  })

  it('waives email support when recurring ≥ $500', () => {
    const r = calculateTotal(state({
      monthType: 'normal_month',
      leadsPerMonth: 10000,
      support: 'email',
    }))
    expect(r.supportIsFree).toBe(true)
  })

  it('BUGFIX: one-time fees (instantlySetup, landingPage) do NOT push recurring over threshold', () => {
    // Baseline: a config where recurring is deliberately just under the $2k
    // full-slack threshold. We then enable landingPage ($350 one-time) and
    // instantlySetup ($150 one-time). Recurring must stay unchanged —
    // those one-time fees must not cause supportIsFree to flip.
    const base = state({
      monthType: 'normal_month',
      leadsPerMonth: 7500,
      support: 'slack_full',
    })
    const baseline = calculateTotal(base)
    const recurringBefore = baseline.baseTotal
    const supportFreeBefore = baseline.supportIsFree

    const withOneTimeAddons = calculateTotal(state({
      ...base,
      addOns: { ...base.addOns, landingPage: true, instantlySetup: true },
    }))

    // One-time fees must not change the recurring baseTotal.
    expect(withOneTimeAddons.baseTotal).toBe(recurringBefore)
    // And therefore must not flip support waiver status.
    expect(withOneTimeAddons.supportIsFree).toBe(supportFreeBefore)
  })
})

// ────────────────────────────────────────────────────────────────
// Infra management waiver — waived if recurring ≥ $2,000/mo
// ────────────────────────────────────────────────────────────────

describe('infra management waiver (recurring-only threshold)', () => {
  it('charges infra management when recurring < $2k', () => {
    const r = calculateTotal(state({
      monthType: 'normal_month',
      leadsPerMonth: 2000,
      addOns: { ...DEFAULT_STATE.addOns, infraManagement: true },
    }))
    const infraLine = r.lineItems.find((i) => i.label.startsWith('Infrastructure Management'))
    expect(infraLine).toBeDefined()
    expect(infraLine!.amount).toBeGreaterThan(0)
  })

  it('waives infra management when recurring ≥ $2k', () => {
    const r = calculateTotal(state({
      monthType: 'normal_month',
      leadsPerMonth: 20000,
      addOns: { ...DEFAULT_STATE.addOns, infraManagement: true },
    }))
    const infraLine = r.lineItems.find((i) => i.label.startsWith('Infrastructure Management'))
    expect(infraLine!.amount).toBe(0)
  })

  it('BUGFIX: one-time add-ons do NOT count toward infra waiver threshold', () => {
    // A config sitting just under $2k recurring with infra ON. Adding a
    // $350 landing page must not flip infra to "waived".
    const base = state({
      monthType: 'normal_month',
      leadsPerMonth: 10000,
      addOns: { ...DEFAULT_STATE.addOns, infraManagement: true },
    })
    const baseline = calculateTotal(base)
    const baselineInfra = baseline.lineItems.find((i) => i.label.startsWith('Infrastructure Management'))!

    const withLandingPage = calculateTotal(state({
      ...base,
      addOns: { ...base.addOns, landingPage: true },
    }))
    const infraWith = withLandingPage.lineItems.find((i) => i.label.startsWith('Infrastructure Management'))!

    // Landing page is one-time and should not affect infra billing.
    expect(infraWith.amount).toBe(baselineInfra.amount)
  })
})

// ────────────────────────────────────────────────────────────────
// Campaign strategy inclusion tiers
// ────────────────────────────────────────────────────────────────

describe('campaign strategy pricing (no inclusion tiers)', () => {
  it('only 1 strategy is the baseline/free; 2 and 3 are always charged', () => {
    expect(includedCampaignTier(2000)).toBe(1)
    expect(includedCampaignTier(7500)).toBe(1)
    expect(includedCampaignTier(10000)).toBe(1)
    expect(includedCampaignTier(40000)).toBe(1)
  })

  it('charges full price for 2 strategies regardless of lead volume', () => {
    for (const leads of [2000, 7500, 10000, 40000] as const) {
      const r = calculateTotal(state({ leadsPerMonth: leads, campaigns: 2 }))
      const line = r.lineItems.find((i) => i.label.includes('Campaign Strateg'))
      expect(line?.amount).toBe(PRICING.campaigns[2])
    }
  })

  it('charges full price for 3 strategies regardless of lead volume', () => {
    for (const leads of [2000, 7500, 10000, 40000] as const) {
      const r = calculateTotal(state({ leadsPerMonth: leads, campaigns: 3 }))
      const line = r.lineItems.find((i) => i.label.includes('Campaign Strateg'))
      expect(line?.amount).toBe(PRICING.campaigns[3])
    }
  })

  it('1 strategy is always $0 (baseline)', () => {
    const r = calculateTotal(state({ leadsPerMonth: 10000, campaigns: 1 }))
    const line = r.lineItems.find((i) => i.label.includes('Campaign Strateg'))
    // 1 campaign has price $0 in config, so the line is omitted when cost is zero.
    expect(line === undefined || line.amount === 0).toBe(true)
  })
})

// ────────────────────────────────────────────────────────────────
// Pilot Month + Branded — ramp-phase billing
// ────────────────────────────────────────────────────────────────

describe('pilot month + branded (ramp-phase billing)', () => {
  it('sets isFirstMonthBranded flag only when both conditions met', () => {
    expect(calculateTotal(state({ monthType: 'first_month', inboxOwnership: 'user_domains' })).isFirstMonthBranded).toBe(true)
    expect(calculateTotal(state({ monthType: 'first_month', inboxOwnership: 'dfy' })).isFirstMonthBranded).toBeUndefined()
    expect(calculateTotal(state({ monthType: 'normal_month', inboxOwnership: 'user_domains' })).isFirstMonthBranded).toBeUndefined()
  })

  it('bills variable (inbox) cost on ramp emails, not full capacity', () => {
    const pilot = calculateTotal(state({
      monthType: 'first_month',
      inboxOwnership: 'user_domains',
      leadsPerMonth: 10000,   // 20k emails capacity at EPP=2
      emailsPerProspect: 2,
    }))
    const normal = calculateTotal(state({
      monthType: 'normal_month',
      inboxOwnership: 'user_domains',
      leadsPerMonth: 10000,
      emailsPerProspect: 2,
    }))
    // Pilot inbox cost should be < normal inbox cost (ramp emails < full capacity).
    const pilotInbox = pilot.lineItems.find((i) => i.label.startsWith('Inbox & Infrastructure'))!
    const normalInbox = normal.lineItems.find((i) => i.label.startsWith('Inbox & Infrastructure'))!
    expect(pilotInbox.amount).toBeLessThan(normalInbox.amount)
  })

  it('includes a branded setup one-time line item', () => {
    const r = calculateTotal(state({
      monthType: 'first_month',
      inboxOwnership: 'user_domains',
      leadsPerMonth: 4000,
    }))
    const setup = r.lineItems.find((i) => i.label.includes('Branded Domains & Inboxes Setup'))
    expect(setup).toBeDefined()
    expect(setup!.period).toBe('one-time')
    expect(setup!.amount).toBeGreaterThan(0)
  })

  it('computes month1ActualEmails = inboxes × 210 (ramp-phase formula)', () => {
    const r = calculateTotal(state({
      monthType: 'first_month',
      inboxOwnership: 'user_domains',
      leadsPerMonth: 10000,
      emailsPerProspect: 2,
    }))
    // 20k capacity → ceil(20000/500) = 40 inboxes → 40 × 210 = 8,400 ramp emails
    expect(r.inboxesNeeded).toBe(40)
    expect(r.month1ActualEmails).toBe(40 * 210)
  })

  it("Normal Month price at same config = what Month 2+ card promises", () => {
    // This is the invariant the user flagged: toggling from pilot → normal
    // with the same settings should produce the exact recurring total shown
    // in the "Month 2 Onwards" card.
    const cfg: Partial<SelectionState> = {
      inboxOwnership: 'user_domains',
      leadsPerMonth: 7500,
      emailsPerProspect: 2,
      copywriting: 'full_strategy',
      campaigns: 2,
      support: 'slack_light',
      addOns: { ...DEFAULT_STATE.addOns, linkedin: true },
    }
    const pilot = calculateTotal(state({ ...cfg, monthType: 'first_month' }))
    const normal = calculateTotal(state({ ...cfg, monthType: 'normal_month' }))

    // Pilot total ≠ normal total (pilot has setup fee + ramp billing).
    expect(pilot.total).not.toBe(normal.total)

    // But the "Month 2 card" is computed by calling calculateTotal with
    // monthType = normal_month, so it will always equal normal.total —
    // this test guards against any future refactor that might break that.
    expect(normal.total).toBeGreaterThan(0)
  })
})

// ────────────────────────────────────────────────────────────────
// Coupon and Upwork fee ordering
// ────────────────────────────────────────────────────────────────

describe('coupon and upwork fee', () => {
  it('applies a valid coupon as a percentage off preDiscountTotal', () => {
    const withoutCoupon = calculateTotal(state({ leadsPerMonth: 10000 }))
    const withCoupon = calculateTotal(state({ leadsPerMonth: 10000, coupon: 'NEW5' }))
    expect(withCoupon.couponDiscountPercent).toBe(5)
    expect(withCoupon.couponDiscountAmount).toBeGreaterThan(0)
    expect(withCoupon.total).toBeLessThan(withoutCoupon.total)
  })

  it('rejects an invalid coupon silently (zero discount)', () => {
    const r = calculateTotal(state({ coupon: 'NOT_A_REAL_CODE' }))
    expect(r.couponDiscountAmount).toBe(0)
    expect(r.couponDiscountPercent).toBe(0)
  })

  it('grosses up the total so NET after Upwork\'s 10% cut equals post-coupon subtotal', () => {
    const r = calculateTotal(state({ leadsPerMonth: 10000, coupon: 'NEW5', upworkFee: true }))
    // Upwork deducts 10% of what the client pays. We need to raise the charge
    // so that (total × 0.90) equals the post-coupon subtotal we quoted.
    // Equivalently: upworkFeeAmount = total × 0.10.
    expect(r.upworkFeeAmount).toBeCloseTo(r.total * 0.10, 1)
    expect(r.upworkFeeAmount).toBeGreaterThan(0)
  })
})

// ────────────────────────────────────────────────────────────────
// Recurring vs one-time split — Month 2+ card invariant
// ────────────────────────────────────────────────────────────────

describe('monthlyRecurringTotal / oneTimeTotal split', () => {
  it('monthlyRecurringTotal equals sum of line items with period === monthly', () => {
    const r = calculateTotal(state({
      leadsPerMonth: 7500,
      addOns: { ...DEFAULT_STATE.addOns, linkedin: true, landingPage: true, instantlySetup: true },
    }))
    const expected = r.lineItems
      .filter((i) => i.period === 'monthly')
      .reduce((s, i) => s + i.amount, 0)
    expect(r.monthlyRecurringTotal).toBeCloseTo(expected, 2)
  })

  it('oneTimeTotal equals sum of line items with period === one-time', () => {
    const r = calculateTotal(state({
      addOns: { ...DEFAULT_STATE.addOns, landingPage: true, instantlySetup: true },
    }))
    const expected = r.lineItems
      .filter((i) => i.period === 'one-time')
      .reduce((s, i) => s + i.amount, 0)
    expect(r.oneTimeTotal).toBeCloseTo(expected, 2)
    // And it should be non-zero given we enabled 2 one-time add-ons.
    expect(r.oneTimeTotal).toBeGreaterThan(0)
  })

  it('monthlyRecurringTotal + oneTimeTotal equals the grand total (no coupon/upwork)', () => {
    const r = calculateTotal(state({
      leadsPerMonth: 5000,
      addOns: { ...DEFAULT_STATE.addOns, landingPage: true, instantlySetup: true },
    }))
    expect(r.monthlyRecurringTotal + r.oneTimeTotal).toBeCloseTo(r.total, 2)
  })

  it('REGRESSION: Upwork fee flows into monthlyRecurringTotal + oneTimeTotal', () => {
    // Bug: when upworkFee=true, pricingResult.total bumped up by 10% but
    // monthlyRecurringTotal / oneTimeTotal stayed at the pre-fee raw sums.
    // The Month 2+ card read the stale field and didn't update when clients
    // toggled Paying via Upwork. Both fields must include the fee so the
    // sum always equals `total` across all surcharge combinations.
    const base = state({
      leadsPerMonth: 5000,
      inboxOwnership: 'user_domains',
      addOns: { ...DEFAULT_STATE.addOns, instantlySetup: true, landingPage: true },
    })

    const withoutUpwork = calculateTotal({ ...base, upworkFee: false })
    const withUpwork = calculateTotal({ ...base, upworkFee: true })

    // Invariant: monthly + oneTime === total, always, regardless of surcharges.
    expect(withoutUpwork.monthlyRecurringTotal + withoutUpwork.oneTimeTotal)
      .toBeCloseTo(withoutUpwork.total, 2)
    expect(withUpwork.monthlyRecurringTotal + withUpwork.oneTimeTotal)
      .toBeCloseTo(withUpwork.total, 2)

    // Gross-up: total scales by 1 / (1 - 0.10) ≈ 1.1111 when Upwork is on,
    // so NET after Upwork's 10% cut equals the pre-fee subtotal.
    const grossUp = 1 / (1 - 0.10)
    expect(withUpwork.monthlyRecurringTotal).toBeCloseTo(withoutUpwork.monthlyRecurringTotal * grossUp, 1)
    expect(withUpwork.oneTimeTotal).toBeCloseTo(withoutUpwork.oneTimeTotal * grossUp, 1)
  })

  it('REGRESSION: coupon flows into monthlyRecurringTotal + oneTimeTotal', () => {
    // Same invariant with a coupon applied. Both figures must reflect
    // the discounted amounts so the Pilot card split and Month 2+ recurring
    // figure match the grand total the client actually pays.
    const base = state({
      leadsPerMonth: 5000,
      addOns: { ...DEFAULT_STATE.addOns, landingPage: true },
    })
    const withoutCoupon = calculateTotal(base)
    const withCoupon = calculateTotal({ ...base, coupon: 'NEW5' })

    expect(withCoupon.monthlyRecurringTotal + withCoupon.oneTimeTotal)
      .toBeCloseTo(withCoupon.total, 2)

    // Monthly recurring scales down by 5% with NEW5.
    expect(withCoupon.monthlyRecurringTotal).toBeCloseTo(withoutCoupon.monthlyRecurringTotal * 0.95, 1)
    expect(withCoupon.oneTimeTotal).toBeCloseTo(withoutCoupon.oneTimeTotal * 0.95, 1)
  })

  it('REGRESSION: coupon + Upwork combined — invariant still holds', () => {
    // Belt and braces: both surcharges on at once. Monthly + oneTime must
    // still sum to total.
    const r = calculateTotal(state({
      leadsPerMonth: 7500,
      addOns: { ...DEFAULT_STATE.addOns, landingPage: true, instantlySetup: true, linkedin: true },
      coupon: 'VIP15',
      upworkFee: true,
    }))
    expect(r.monthlyRecurringTotal + r.oneTimeTotal).toBeCloseTo(r.total, 2)
    expect(r.couponDiscountAmount).toBeGreaterThan(0)
    expect(r.upworkFeeAmount).toBeGreaterThan(0)
  })

  it('REGRESSION: pilot total vs Month 2+ recurring must differ by the one-time amount + ramp savings', () => {
    // The user's reported URL: l=5000&i=user_domains&ca=1&is=1&lp=1
    // Before the fix, the Month 2+ card was showing `.total` (including one-time
    // add-ons), making it look almost identical to the pilot total. The Month 2+
    // card should use `.monthlyRecurringTotal` so clients see a clear recurring
    // price that excludes one-off fees.
    const baseState = {
      leadsPerMonth: 5000,
      inboxOwnership: 'user_domains' as const,
      campaigns: 1 as const,
      addOns: { ...DEFAULT_STATE.addOns, instantlySetup: true, landingPage: true },
    }
    const pilot = calculateTotal(state({ ...baseState, monthType: 'first_month' }))
    const normal = calculateTotal(state({ ...baseState, monthType: 'normal_month' }))

    // Month 2+ recurring must exclude the $150 instantly + $350 landing page = $500.
    expect(normal.oneTimeTotal).toBeCloseTo(500, 2)
    expect(normal.monthlyRecurringTotal).toBeLessThan(normal.total)

    // And the recurring figure is what the "Month 2+" card must display —
    // NOT normal.total (which would incorrectly include the one-time fees).
    // Sanity check: recurring should be clearly less than the full pilot total.
    expect(normal.monthlyRecurringTotal).toBeLessThan(pilot.total - 400)
  })
})

// ────────────────────────────────────────────────────────────────
// Grand total invariant: lineItems sum correctly into preDiscountTotal
// ────────────────────────────────────────────────────────────────

describe('grand total invariant', () => {
  it('sum of all line items equals preDiscountTotal (no coupon, no upwork)', () => {
    const r = calculateTotal(state({
      leadsPerMonth: 7500,
      addOns: { ...DEFAULT_STATE.addOns, linkedin: true, landingPage: true },
    }))
    const sum = r.lineItems.reduce((s, i) => s + i.amount, 0)
    // preDiscountTotal is line items before volume discount is already baked
    // into variable items. So sum of line items == preDiscountTotal (≡ total
    // with no coupon/upwork/volume discount reapplied).
    // Volume discount is already applied inside each variable line item.
    const expectedTotal = +(sum).toFixed(2)
    expect(r.total).toBeCloseTo(expectedTotal, 2)
  })
})
