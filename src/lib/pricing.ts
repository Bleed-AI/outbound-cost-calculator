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
 * Sending-infrastructure counts for a given full email volume.
 *
 * Capacity model (NO ramp): after a 2-week warmup, each inbox sends at full
 * capacity (`emailsPerInboxPerDay`) on weekdays for a fixed 4-week window.
 *   emails an inbox sends across the campaign = perDay × (sendingWeeks × sendingDaysPerWeek)
 * Inboxes scale to fit the selected volume into that window; domains hold
 * `inboxesPerDomain` inboxes each. A small failover buffer adds one backup
 * domain (with its inboxes) per `backupDomainPerEmails` of total volume.
 */
export interface InfraCounts {
  /** Inboxes that actually carry the send volume. */
  sendingInboxes: number
  /** Domains holding the sending inboxes. */
  primaryDomains: number
  /** Failover backup domains (one per `backupDomainPerEmails`). */
  backupDomains: number
  /** Inboxes on the backup domains. */
  backupInboxes: number
  /** Total inboxes provisioned (sending + backup) — what the client keeps. */
  inboxes: number
  /** Total domains provisioned (primary + backup). */
  domains: number
  /** Weekday sending days across the 4-week window. */
  sendingDays: number
  /** Emails a single inbox sends across the whole campaign. */
  perInbox: number
}

export function computeInfraCounts(totalEmails: number): InfraCounts {
  const c = PRICING.capacity
  const sendingDays = c.sendingWeeks * c.sendingDaysPerWeek           // 4 × 5 = 20
  const perInbox = c.emailsPerInboxPerDay * sendingDays               // 27 × 20 = 540
  const sendingInboxes = Math.max(1, Math.ceil(totalEmails / perInbox))
  const primaryDomains = Math.max(1, Math.ceil(sendingInboxes / c.inboxesPerDomain))
  const backupDomains = Math.floor(totalEmails / c.backupDomainPerEmails)
  const backupInboxes = backupDomains * c.inboxesPerDomain
  return {
    sendingInboxes,
    primaryDomains,
    backupDomains,
    backupInboxes,
    inboxes: sendingInboxes + backupInboxes,
    domains: primaryDomains + backupDomains,
    sendingDays,
    perInbox,
  }
}

/** Volume-tiered per-inbox monthly hosting rate (cheaper at scale). */
export function inboxMonthlyRate(inboxCount: number): number {
  const r = PRICING.infraIncluded
  if (inboxCount >= 100) return r.inboxRateHigh
  if (inboxCount >= 30) return r.inboxRateMid
  return r.inboxRateBase
}

/**
 * Two-phase campaign timeline (NO ramp): 2 weeks warmup → 4 weeks full-capacity
 * sending. Duration is a fixed 6 weeks regardless of volume; inbox count flexes
 * to deliver the selected volume inside the sending window.
 */
export interface CampaignPhases {
  inboxes: number
  domains: number
  sendingInboxes: number
  warmupDays: number
  sendingDays: number          // weekday sends
  sendingCalendarDays: number  // 4 weeks = 28 calendar days
  totalDays: number            // 42 (6 weeks)
  dailyVolume: number          // full-capacity emails/day once sending
  warmupStart: number
  warmupEnd: number
  sendStart: number
  sendEnd: number
}

export function computeCampaignPhases(totalEmails: number): CampaignPhases {
  const counts = computeInfraCounts(totalEmails)
  const c = PRICING.capacity
  const sendingCalendarDays = c.sendingWeeks * 7           // 28
  const totalDays = c.warmupDays + sendingCalendarDays     // 14 + 28 = 42
  const dailyVolume = counts.sendingInboxes * c.emailsPerInboxPerDay
  return {
    inboxes: counts.inboxes,
    domains: counts.domains,
    sendingInboxes: counts.sendingInboxes,
    warmupDays: c.warmupDays,
    sendingDays: counts.sendingDays,
    sendingCalendarDays,
    totalDays,
    dailyVolume,
    warmupStart: 1,
    warmupEnd: c.warmupDays,
    sendStart: c.warmupDays + 1,
    sendEnd: totalDays,
  }
}

/** Total campaign duration in days (fixed 6-week window). */
export function computeCampaignDays(_totalEmails: number): number {
  return PRICING.capacity.warmupDays + PRICING.capacity.sendingWeeks * 7
}

/** Monthly system capacity the provisioned inboxes could sustain (side-note only). */
export function computeMonthlyCapacity(inboxes: number): number {
  const c = PRICING.capacity
  return inboxes * c.emailsPerInboxPerDay * c.weekdaysPerMonth
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

  // Sending-infrastructure counts from the no-ramp capacity model.
  const infra = computeInfraCounts(totalEmails)
  const inboxesNeeded = isFirstMonthBranded ? infra.inboxes : undefined
  const domainsNeeded = isFirstMonthBranded ? infra.domains : undefined
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

  // Managed sending & deliverability — the SERVICE of running the sends on the
  // branded infra (warmup oversight, inbox rotation, AI inbox placement, daily
  // monitoring). The physical domains+inboxes themselves are priced separately
  // and folded into the total as an included bonus (see infraIncludedCost below).
  const inboxCostRaw = (billingEmails / 1000) * inboxRate
  lineItems.push({
    label: `Managed Sending & Deliverability — $${inboxRate}/1k emails (warmup, inbox rotation, AI placement & daily monitoring)`,
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

  // ── Branded domains + inboxes folded into the total (NOT discounted) ──────
  // Client keeps these assets: domains registered 1 year + inboxes hosted for
  // `monthsIncluded` months. Volume discount and coupons do NOT touch this —
  // it's added on top as an included bonus. Only present for branded campaigns.
  const inboxRateUsed = inboxMonthlyRate(infra.inboxes)
  const infraDomainCost = isFirstMonthBranded
    ? fmt(infra.domains * PRICING.infraIncluded.domainCostPerYear)
    : 0
  const infraInboxCost = isFirstMonthBranded
    ? fmt(infra.inboxes * inboxRateUsed * PRICING.infraIncluded.monthsIncluded)
    : 0
  const infraIncludedCost = fmt(infraDomainCost + infraInboxCost)

  const afterDiscountsWithInfra = fmt(afterDiscounts + infraIncludedCost)

  // Gross-up: Upwork deducts the fee from what the client pays, so we must
  // raise the charge so the NET we receive equals `afterDiscountsWithInfra`.
  const feeRate = UPWORK_FEE_PERCENT / 100
  const total = state.upworkFee ? fmt(afterDiscountsWithInfra / (1 - feeRate)) : fmt(afterDiscountsWithInfra)
  const upworkFeeAmount = state.upworkFee ? fmt(total - afterDiscountsWithInfra) : 0

  const monthlyCapacity = isFirstMonthBranded ? computeMonthlyCapacity(infra.inboxes) : totalEmails

  // Split the final `total` proportionally between monthly and one-time.
  // Both the Pilot card and Month 2+ card read these fields, so they must
  // include coupon discount AND Upwork fee — otherwise the cards silently
  // drift from the grand total when those surcharges are toggled.
  // Computing oneTime as a subtraction guarantees monthly + oneTime === total.
  // Infra-included counts as a one-time asset cost for the monthly/one-time split.
  const oneTimeRawWithInfra = oneTimeRaw + infraIncludedCost
  const rawSum = monthlyRecurringRaw + oneTimeRawWithInfra
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
    // Branded infra folded into the total (NOT discounted) — surfaced for the
    // "included, yours to keep" block + its on-demand breakdown.
    infraIncludedCost,
    infraDomainCost,
    infraInboxCost,
    inboxMonthlyRate: inboxRateUsed,
    monthsIncluded: PRICING.infraIncluded.monthsIncluded,
    monthlyCapacity,
    backupDomains: infra.backupDomains,
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
