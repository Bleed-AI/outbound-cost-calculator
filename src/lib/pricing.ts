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

export const DEFAULT_STATE: SelectionState = {
  setup: 'none',
  leadsPerMonth: 2000,
  emailsPerProspect: 2,
  inboxOwnership: 'user_domains',
  dataSource: 'full_list',
  enrichments: 'none',
  copywriting: 'finalized',
  campaigns: 1,
  replyHandling: 'none',
  support: 'email',
  addOns: {
    linkedin: false,
    crm: false,
    dripSequence: false,
    infraManagement: false,
  },
  coupon: '',
}

export const LEADS_OPTIONS: LeadsPerMonth[] = [2000, 4000, 7500, 10000, 20000, 40000]
export const EPP_OPTIONS: EmailsPerProspect[] = [1, 2, 3]
export const CAMPAIGNS_OPTIONS: CampaignsCount[] = [1, 2, 3]

const fmt = (n: number) => Math.round(n * 100) / 100

export function calculateTotal(state: SelectionState): PricingResult {
  const totalEmails = state.leadsPerMonth * state.emailsPerProspect
  const discountPercent = PRICING.volumeDiscounts[state.leadsPerMonth] ?? 0
  const multiplier = 1 - discountPercent
  const lineItems: LineItem[] = []

  // ── Fixed costs (no volume discount) ─────────────────────────────────────

  if (state.setup !== 'none') {
    lineItems.push({
      label:
        state.setup === 'full_dfy'
          ? 'Full DFY Instantly System Setup'
          : 'Branded Domains & Inboxes Setup',
      amount: PRICING.setup[state.setup],
      type: 'fixed',
      period: 'one-time',
    })
  }

  lineItems.push({
    label:
      state.copywriting === 'finalized'
        ? 'Copywriting — Existing Strategy (Deliverability Optimisation)'
        : 'Copywriting — Full Strategy + A/B Testing',
    amount: PRICING.copywriting[state.copywriting as CopywritingOption],
    type: 'fixed',
    period: 'one-time',
  })

  const campaignsCost = PRICING.campaigns[state.campaigns as CampaignsCount]
  if (campaignsCost > 0) {
    lineItems.push({
      label: `${state.campaigns} Campaigns`,
      amount: campaignsCost,
      type: 'fixed',
      period: 'one-time',
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

  lineItems.push({
    label:
      state.support === 'email'
        ? 'Support — Light Email / Upwork'
        : state.support === 'slack_light'
        ? 'Support — Light Slack'
        : 'Support — Full Slack + Calls (5 days/week)',
    amount: PRICING.support[state.support as SupportTier],
    type: 'fixed',
    period: 'per-campaign',
  })

  // ── Variable costs (volume discount applied) ──────────────────────────────

  const inboxRate = PRICING.inboxOwnership[state.inboxOwnership as InboxOwnership]
  const inboxCostRaw = (totalEmails / 1000) * inboxRate
  lineItems.push({
    label: `Inbox & Infrastructure — $${inboxRate}/1k emails (${
      state.inboxOwnership === 'user_domains'
        ? 'Your Branded Domains/Inboxes'
        : state.inboxOwnership === 'user_domains_instantly'
        ? 'Your Domains + Instantly.ai Account'
        : 'DFY — We Use Our Warm Infrastructure'
    })`,
    amount: fmt(inboxCostRaw * multiplier),
    type: 'variable',
    period: 'one-time',
  })

  const dataRate = PRICING.dataSource[state.dataSource as DataSource]
  const dataCostRaw = (state.leadsPerMonth / 1000) * dataRate
  const dataLabels: Record<string, string> = {
    full_list: 'Lead Data — Full List Provided + Email Validation',
    full_list_validate: 'Lead Data — Full List + Validate + Find Missing Emails',
    dfy_scrape: 'Lead Data — Full DFY Scraping (LinkedIn / Apollo / Maps / Instagram)',
    directory: 'Lead Data — Directory Scraping + Clean & Enrich',
    live_signal: 'Lead Data — Custom Live Signal Campaign',
    multi_platform: 'Lead Data — Multi-Platform Custom System',
  }
  lineItems.push({
    label: `${dataLabels[state.dataSource]} — $${dataRate}/1k leads`,
    amount: fmt(dataCostRaw * multiplier),
    type: 'variable',
    period: 'one-time',
  })

  const enrichRate = PRICING.enrichments[state.enrichments as Enrichments]
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
      period: 'one-time',
    })
  }

  if (state.replyHandling !== 'none') {
    const replyRate = PRICING.replyHandling[state.replyHandling as ReplyHandling]
    const replyCostRaw = (totalEmails / 1000) * (replyRate as number)
    lineItems.push({
      label: `Reply Handling — $${replyRate}/1k emails (${
        state.replyHandling === 'ai_instantly'
          ? 'AI Agent + Book Calls via Instantly.ai'
          : 'Custom n8n Agent + Reverse Lead Magnets'
      })`,
      amount: fmt((replyCostRaw as number) * multiplier),
      type: 'variable',
      period: 'one-time',
    })
  }

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

  if (state.addOns.infraManagement) {
    lineItems.push({
      label: 'Infrastructure Management + Domain Rotation Protocols',
      amount: PRICING.addOns.infra_management,
      type: 'addon',
      period: 'one-time',
    })
  }

  // ── Totals ────────────────────────────────────────────────────────────────

  const fixedSubtotal = lineItems
    .filter((i) => i.type === 'fixed')
    .reduce((s, i) => s + i.amount, 0)

  const variableSubtotal = lineItems
    .filter((i) => i.type === 'variable')
    .reduce((s, i) => s + i.amount, 0)

  const addonSubtotal = lineItems
    .filter((i) => i.type === 'addon')
    .reduce((s, i) => s + i.amount, 0)

  // Raw variable cost before discount (for showing savings)
  const variableSubtotalBeforeDiscount =
    (totalEmails / 1000) * inboxRate +
    (state.leadsPerMonth / 1000) * dataRate +
    (state.replyHandling !== 'none'
      ? (totalEmails / 1000) * (PRICING.replyHandling[state.replyHandling as ReplyHandling] as number)
      : 0) +
    (enrichRate > 0 ? (state.leadsPerMonth / 1000) * enrichRate : 0)

  const discountAmount = fmt(variableSubtotalBeforeDiscount * discountPercent)
  const total = fmt(fixedSubtotal + variableSubtotal + addonSubtotal)

  return {
    lineItems,
    fixedSubtotal: fmt(fixedSubtotal),
    variableSubtotalBeforeDiscount: fmt(variableSubtotalBeforeDiscount),
    variableSubtotal: fmt(variableSubtotal),
    addonSubtotal: fmt(addonSubtotal),
    discountAmount,
    discountPercent: discountPercent * 100,
    total,
    totalEmails,
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
