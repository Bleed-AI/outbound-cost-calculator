import { PRICING } from './pricing.config'
import type {
  SelectionState,
  LineItem,
  PricingResult,
  LeadsPerMonth,
  EmailsPerProspect,
  InboxOwnership,
  DataSource,
  Enrichments,
  CopywritingOption,
  CampaignsCount,
  ReplyHandling,
  SupportTier,
} from './types'

// Simplified single-campaign defaults. Hidden config is locked to these.
// The 3 visible controls are: leadsPerMonth, emailsPerProspect, campaigns.
export const DEFAULT_STATE: SelectionState = {
  monthType: 'first_month',        // forced — produces ramp-billed "Your Campaign"
  leadsPerMonth: 4000,
  emailsPerProspect: 2,
  inboxOwnership: 'user_domains',  // forced — branded by default
  dataSource: 'dfy_scrape',
  enrichments: 'standard',
  copywriting: 'full_strategy',
  campaigns: 1,
  replyHandling: 'ai_instantly',
  support: 'slack_light',          // default — standard Slack support at $200/mo
  addOns: {
    linkedin: false,
    crm: false,
    dripSequence: false,
    infraManagement: false,
    instantlySetup: false,
    landingPage: false,
  },
  coupon: '',
  upworkFee: false,
}

export const UPWORK_FEE_PERCENT = 10

export const LEADS_OPTIONS: LeadsPerMonth[] = [2000, 4000, 7500, 10000, 20000, 40000]

export const COUPON_CODES: Record<string, number> = {
  NEW5: 5,
  SPECIAL10: 10,
  VIP15: 15,
  ULTRA20: 20,
  PLATINUM25: 25,  // Premium — issued selectively
  DIAMOND33: 33,   // Ultra-premium — issued to very few
}
export const EPP_OPTIONS: EmailsPerProspect[] = [1, 2, 3]
export const CAMPAIGNS_OPTIONS: CampaignsCount[] = [1, 2, 3, 4, 5]

const fmt = (n: number) => Math.round(n * 100) / 100

/**
 * How many campaign strategies are included (free) at the given lead volume.
 * Policy: only the baseline (1 campaign) is included — 2 and 3 are always
 * charged at full price regardless of lead volume.
 * Param kept for signature stability, but the function is now constant.
 */
export function includedCampaignTier(_leads: LeadsPerMonth): CampaignsCount {
  return 1
}

/**
 * Compute the 4-phase campaign timeline for a given full email volume.
 *
 * Phases:
 *   1. Day 1               — Infrastructure setup & kickoff
 *   2. Days 2 – 15         — Provider warmup (zero sends)
 *   3. Days 16 – (15+R)    — Outbound ramp (R = config.rampDays, delivers ~rampEmails)
 *   4. Days (16+R) – total — Steady-state sends (remaining emails at peak inbox throughput)
 *
 * Inbox throughput math: each inbox starts at `startPerDay` on ramp day 1 and
 * climbs by `dailyIncrement` each day. After ramp ends, inbox sustains the
 * peak (≈ startPerDay + (rampDays-1) × dailyIncrement) per day.
 */
export interface CampaignPhases {
  inboxes: number
  rampDays: number
  rampEmails: number
  steadyDays: number
  steadyEmails: number
  totalDays: number
  /** Inclusive day labels for display, e.g. {rampStart: 16, rampEnd: 30, steadyStart: 31, steadyEnd: 39} */
  rampStart: number
  rampEnd: number
  steadyStart: number
  steadyEnd: number
}

export function computeCampaignPhases(totalEmails: number): CampaignPhases {
  const inboxes = Math.max(1, Math.ceil(totalEmails / 500))
  const { rampDays, startPerDay, dailyIncrement } = PRICING.warmup
  const rampPerInbox = (rampDays / 2) * (2 * startPerDay + (rampDays - 1) * dailyIncrement)
  const rampEmails = Math.min(totalEmails, Math.round(inboxes * rampPerInbox))
  const steadyEmails = Math.max(0, totalEmails - rampEmails)
  const peakDailyVolume = inboxes * (startPerDay + (rampDays - 1) * dailyIncrement)
  const steadyDays = steadyEmails > 0 ? Math.ceil(steadyEmails / peakDailyVolume) : 0
  const totalDays = 1 /* setup */ + 14 /* warmup */ + rampDays + steadyDays

  // Display day labels
  const rampStart = 16
  const rampEnd = 15 + rampDays
  const steadyStart = rampEnd + 1
  const steadyEnd = totalDays

  return { inboxes, rampDays, rampEmails, steadyDays, steadyEmails, totalDays, rampStart, rampEnd, steadyStart, steadyEnd }
}

/** Total campaign duration in days. */
export function computeCampaignDays(totalEmails: number): number {
  return computeCampaignPhases(totalEmails).totalDays
}

/** Contract date range: start = today + 2 days, end = start + computed campaign days */
export function getContractDates(totalEmails: number = 8000): { start: Date; end: Date } {
  const start = new Date()
  start.setDate(start.getDate() + 2)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + computeCampaignDays(totalEmails))
  return { start, end }
}

export function calculateTotal(state: SelectionState): PricingResult {
  // Full capacity emails (leads × emails per prospect) — this is also what we bill on.
  // Simplified single-campaign mode bills for ALL sends, not just the ramp.
  const totalEmails = state.leadsPerMonth * state.emailsPerProspect

  // Branded setup applies whenever the user is getting branded domains spun up.
  // In simplified single-campaign mode, monthType is locked to 'first_month' and
  // inboxOwnership to 'user_domains', so this is always true today.
  const isFirstMonthBranded = state.monthType === 'first_month' && state.inboxOwnership === 'user_domains'

  const inboxesNeeded = isFirstMonthBranded ? Math.ceil(totalEmails / 500) : undefined
  const domainsNeeded = isFirstMonthBranded ? Math.ceil(totalEmails / 1500) : undefined
  // For backward compatibility we still expose `month1ActualEmails` in the result,
  // but it now mirrors `totalEmails` — every send is billed.
  const month1ActualEmails = isFirstMonthBranded ? totalEmails : undefined

  // Billing base is always the full email volume.
  const billingEmails = totalEmails

  // Volume discount — based on lead count
  const discountPercent = Object.entries(PRICING.volumeDiscounts)
    .filter(([k]) => Number(k) <= state.leadsPerMonth)
    .reduce((best, [k, v]) => (Number(k) > best.k ? { k: Number(k), v: v as number } : best), { k: 0, v: 0 })
    .v
  const multiplier = 1 - discountPercent
  const lineItems: LineItem[] = []

  // ── Rate lookups ──────────────────────────────────────────────────────────
  const inboxRate = PRICING.inboxOwnership[state.inboxOwnership as InboxOwnership]
  const dataRate = PRICING.dataSource[state.dataSource as DataSource]
  const enrichRate = PRICING.enrichments[state.enrichments as Enrichments]
  const replyRate = state.replyHandling !== 'none'
    ? (PRICING.replyHandling[state.replyHandling as ReplyHandling] as number)
    : 0

  // ── Branded setup (Scenario 3 only) ──────────────────────────────────────
  let brandedSetupFee: number | undefined

  if (isFirstMonthBranded) {
    brandedSetupFee = PRICING.brandedSetup.baseSetupFee +
      Math.max(0, inboxesNeeded! - PRICING.brandedSetup.extraInboxThreshold) * PRICING.brandedSetup.extraPerInbox

    const feeLabel = inboxesNeeded! > PRICING.brandedSetup.extraInboxThreshold
      ? `$${PRICING.brandedSetup.baseSetupFee} + ${inboxesNeeded! - PRICING.brandedSetup.extraInboxThreshold}×$${PRICING.brandedSetup.extraPerInbox}`
      : `$${PRICING.brandedSetup.baseSetupFee} flat`

    lineItems.push({
      label: `Branded Domains & Inboxes Setup (${inboxesNeeded} inboxes — ${feeLabel})`,
      amount: brandedSetupFee,
      type: 'fixed',
      period: 'one-time',
    })
  }

  // ── Instantly Account Setup (optional add-on, always available) ───────────
  if (state.addOns.instantlySetup) {
    lineItems.push({
      label: 'Instantly Account Setup',
      amount: PRICING.setup.instantly_setup,
      type: 'fixed',
      period: 'one-time',
    })
  }

  // ── Fixed costs (no volume discount) ─────────────────────────────────────

  lineItems.push({
    label:
      state.copywriting === 'finalized'
        ? 'Copywriting — Existing Strategy (Deliverability Optimisation)'
        : 'Copywriting — Full Strategy + A/B Testing',
    amount: PRICING.copywriting[state.copywriting as CopywritingOption],
    type: 'fixed',
    period: 'monthly',
  })

  // Campaign strategy — cost reduced by included tiers
  const includedTier = includedCampaignTier(state.leadsPerMonth)
  const campaignsCostFull = PRICING.campaigns[state.campaigns as CampaignsCount]
  const campaignsCostIncluded = PRICING.campaigns[includedTier as CampaignsCount]
  const campaignsCost = state.campaigns > includedTier
    ? campaignsCostFull - campaignsCostIncluded
    : 0
  if (campaignsCostFull > 0) {
    lineItems.push({
      label: `${state.campaigns} Campaign Experiment${state.campaigns > 1 ? 's' : ''}${campaignsCost === 0 ? ' (Included)' : ''}`,
      amount: campaignsCost,
      type: 'fixed',
      period: 'monthly',
    })
  }

  if (state.replyHandling === 'custom_n8n') {
    lineItems.push({
      label: 'Custom n8n Reply Agent — One-Time Build Fee',
      amount: PRICING.replyHandling.n8n_setup,
      type: 'fixed',
      period: 'one-time',
    })
  }

  // ── Variable costs (volume discount applied, using billingEmails) ─────────

  const inboxCostRaw = (billingEmails / 1000) * inboxRate
  lineItems.push({
    label: `Inbox & Infrastructure — $${inboxRate}/1k emails (${
      state.inboxOwnership === 'user_domains'
        ? "Client's Branded Domains & Inboxes"
        : "BleedAI's Warm Infrastructure"
    })`,
    amount: fmt(inboxCostRaw * multiplier),
    type: 'variable',
    period: 'monthly',
  })

  const dataCostRaw = (state.leadsPerMonth / 1000) * dataRate
  const dataLabels: Record<string, string> = {
    full_list: 'Lead Data — Client Provides Full List + Email Validation',
    full_list_validate: "Lead Data — Client's List + BleedAI Validates & Recovers Missing",
    dfy_scrape: 'Lead Data — Full DFY: BleedAI Sources, Scrapes & Validates',
    directory: 'Lead Data — BleedAI Scrapes From Specified Directory',
    live_signal: 'Lead Data — BleedAI Builds Custom Live Signal Campaign',
    multi_platform: 'Lead Data — BleedAI Builds Custom Multi-Platform Sourcing System',
  }
  lineItems.push({
    label: `${dataLabels[state.dataSource]} — $${dataRate}/1k leads`,
    amount: fmt(dataCostRaw * multiplier),
    type: 'variable',
    period: 'monthly',
  })

  if (enrichRate > 0) {
    const enrichCostRaw = (state.leadsPerMonth / 1000) * enrichRate
    lineItems.push({
      label: `Additional Enrichments — $${enrichRate}/1k leads (${
        state.enrichments === 'standard'
          ? 'Website + AI Personalisation + Others'
          : 'Advanced Signal-Based / Custom Clay'
      })`,
      amount: fmt(enrichCostRaw * multiplier),
      type: 'variable',
      period: 'monthly',
    })
  }

  if (state.replyHandling !== 'none') {
    const replyCostRaw = (billingEmails / 1000) * replyRate
    lineItems.push({
      label: `Reply Handling — $${replyRate}/1k emails (${
        state.replyHandling === 'ai_instantly'
          ? 'AI Agent via Instantly.ai'
          : 'Custom n8n Agent'
      })`,
      amount: fmt(replyCostRaw * multiplier),
      type: 'variable',
      period: 'monthly',
    })
  }

  // ── Variable subtotal before discount (based on billing emails) ───────────
  const inboxBillingRaw = (billingEmails / 1000) * inboxRate
  const dataBillingRaw = (state.leadsPerMonth / 1000) * dataRate
  const enrichBillingRaw = enrichRate > 0 ? (state.leadsPerMonth / 1000) * enrichRate : 0
  const replyBillingRaw = replyRate > 0 ? (billingEmails / 1000) * replyRate : 0
  const variableSubtotalBeforeDiscount =
    inboxBillingRaw + dataBillingRaw + enrichBillingRaw + replyBillingRaw

  // ── Add-ons ───────────────────────────────────────────────────────────────

  if (state.addOns.linkedin) {
    lineItems.push({
      label: 'LinkedIn Connection Requests + Custom Actions',
      amount: PRICING.addOns.linkedin_monthly,
      type: 'addon',
      period: 'monthly',
    })
  }

  if (state.addOns.crm) {
    lineItems.push({
      label: 'CRM Integration',
      amount: PRICING.addOns.crm_monthly,
      type: 'addon',
      period: 'monthly',
    })
  }

  if (state.addOns.dripSequence) {
    lineItems.push({
      label: 'Custom Drip Sequence — Setup Fee',
      amount: PRICING.addOns.drip_onetime,
      type: 'addon',
      period: 'one-time',
    })
    lineItems.push({
      label: 'Custom Drip Sequence — Monthly Management',
      amount: PRICING.addOns.drip_monthly,
      type: 'addon',
      period: 'monthly',
    })
  }

  if (state.addOns.landingPage) {
    lineItems.push({
      label: 'Landing Page Build',
      amount: PRICING.addOns.landingPage,
      type: 'addon',
      period: 'one-time',
    })
  }

  // ── Threshold base is RECURRING SPEND ONLY ───────────────────────────────
  // One-time fees (branded setup, n8n setup, instantly setup, drip one-time,
  // landing page) must NOT count toward the monthly-recurring thresholds
  // that waive support and infra management — they're one-off costs that
  // don't reflect ongoing spend. We filter line items by `period === 'monthly'`
  // for all waiver checks, while still including them in the grand total.

  const sumMonthly = (items: LineItem[]) =>
    items.filter((i) => i.period === 'monthly').reduce((s, i) => s + i.amount, 0)

  // Recurring spend BEFORE infra management is added — used for infra waiver
  const recurringPreInfra = fmt(sumMonthly(lineItems))

  const infraCostRaw = fmt((billingEmails / 1000) * PRICING.addOns.infra_management)
  const infraIsWaived = recurringPreInfra >= PRICING.infraWaiverThreshold

  if (state.addOns.infraManagement) {
    lineItems.push({
      label: `Infrastructure Management & Domain Rotation${infraIsWaived ? ' (Included — recurring ≥ $2k/mo)' : ''}`,
      amount: infraIsWaived ? 0 : infraCostRaw,
      type: 'addon',
      period: 'monthly',
    })
  }

  // Recurring spend BEFORE support is added — used for support waiver.
  // This is also what we return as `baseTotal` so the UI's "free if > $X"
  // messages and nudges reflect the same recurring-only amount.
  const recurringPreSupport = fmt(sumMonthly(lineItems))
  const baseTotal = recurringPreSupport

  // Support is always charged — no auto-waiver.
  const supportCost = PRICING.support[state.support as SupportTier]
  const supportIsFree = false
  const supportThreshold = 0

  lineItems.push({
    label:
      state.support === 'email'
        ? 'Support — Email'
        : state.support === 'slack_light'
        ? 'Support — Standard Slack'
        : 'Support — Full Slack + Calls',
    amount: supportCost,
    type: 'fixed',
    period: 'monthly',
  })

  // ── Final subtotals (after all line items pushed) ─────────────────────────

  const fixedSubtotal = fmt(lineItems
    .filter((i) => i.type === 'fixed')
    .reduce((s, i) => s + i.amount, 0))

  const variableSubtotal = lineItems
    .filter((i) => i.type === 'variable')
    .reduce((s, i) => s + i.amount, 0)

  const addonSubtotal = fmt(lineItems
    .filter((i) => i.type === 'addon')
    .reduce((s, i) => s + i.amount, 0))

  // Raw split of line items by period — before coupon and Upwork fee.
  const monthlyRecurringRaw = sumMonthly(lineItems)
  const oneTimeRaw = lineItems
    .filter((i) => i.period === 'one-time')
    .reduce((s, i) => s + i.amount, 0)

  const discountAmount = fmt(variableSubtotalBeforeDiscount * discountPercent)

  // Pre-discount grand total = all monthly recurring + all one-time fees.
  const preDiscountTotal = fmt(monthlyRecurringRaw + oneTimeRaw)

  const couponPercent = COUPON_CODES[state.coupon?.toUpperCase?.() ?? ''] ?? 0
  const couponDiscountAmount = couponPercent > 0 ? fmt(preDiscountTotal * (couponPercent / 100)) : 0
  const afterDiscounts = fmt(preDiscountTotal - couponDiscountAmount)
  // Gross-up: Upwork deducts the fee from what the client pays, so we must
  // raise the charge so the NET we receive equals `afterDiscounts`.
  // total = afterDiscounts / (1 - fee); upworkFeeAmount = total - afterDiscounts.
  const feeRate = UPWORK_FEE_PERCENT / 100
  const total = state.upworkFee ? fmt(afterDiscounts / (1 - feeRate)) : fmt(afterDiscounts)
  const upworkFeeAmount = state.upworkFee ? fmt(total - afterDiscounts) : 0

  // Split the final `total` proportionally between monthly and one-time.
  // Both the Pilot card and Month 2+ card read these fields, so they must
  // include coupon discount AND Upwork fee — otherwise the cards silently
  // drift from the grand total when those surcharges are toggled.
  // Computing oneTime as a subtraction guarantees monthly + oneTime === total.
  const rawSum = monthlyRecurringRaw + oneTimeRaw
  const monthlyRatio = rawSum > 0 ? monthlyRecurringRaw / rawSum : 1
  const monthlyRecurringTotal = fmt(total * monthlyRatio)
  const oneTimeTotal = fmt(total - monthlyRecurringTotal)

  return {
    lineItems,
    fixedSubtotal: fmt(fixedSubtotal),
    variableSubtotalBeforeDiscount: fmt(variableSubtotalBeforeDiscount),
    variableSubtotal: fmt(variableSubtotal),
    addonSubtotal: fmt(addonSubtotal),
    discountAmount,
    discountPercent: discountPercent * 100,
    total,
    monthlyRecurringTotal,
    oneTimeTotal,
    totalEmails,
    baseTotal,
    supportIsFree,
    supportThreshold,
    couponDiscountAmount,
    couponDiscountPercent: couponPercent,
    upworkFeeAmount,
    ...(isFirstMonthBranded && {
      isFirstMonthBranded: true,
      month1ActualEmails,
      brandedSetupFee,
      inboxesNeeded,
      domainsNeeded,
    }),
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
