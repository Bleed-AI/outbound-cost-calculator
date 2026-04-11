import { DEFAULT_STATE } from './pricing'
import type { SelectionState, EmailsPerProspect, CampaignsCount, MonthType, InboxOwnership } from './types'

type SearchParamsLike = { get: (key: string) => string | null }

const P = {
  monthType: 'mt',
  leads: 'l',
  epp: 'e',
  inbox: 'i',
  data: 'd',
  enrich: 'en',
  copy: 'c',
  camps: 'ca',
  reply: 'r',
  support: 'su',
  li: 'li',
  crm: 'cr',
  drip: 'dr',
  infra: 'in',
  instantly: 'is',
  landing: 'lp',
  coupon: 'cp',
  upwork: 'uw',
} as const

function valid<T extends string>(val: string | null, allowed: T[], fallback: T): T {
  return val !== null && (allowed as string[]).includes(val) ? (val as T) : fallback
}

function validNum<T extends number>(val: string | null, allowed: T[], fallback: T): T {
  const n = Number(val)
  return !isNaN(n) && (allowed as number[]).includes(n) ? (n as T) : fallback
}

export function parseState(params: SearchParamsLike): SelectionState {
  // Legacy: old 's' param (setup field) → derive monthType + inboxOwnership
  const legacySetup = params.get('s')
  const legacyInbox = params.get('i')

  // Legacy full_dfy → first_month + user_domains + instantlySetup
  const isLegacyFullDfy = legacySetup === 'full_dfy'
  // Legacy branded_only → first_month + user_domains
  const isLegacyBranded = legacySetup === 'branded_only' || isLegacyFullDfy
  // Legacy user_domains_instantly → user_domains
  const isLegacyInstantly = legacyInbox === 'user_domains_instantly'

  // Determine monthType
  let monthType: MonthType = DEFAULT_STATE.monthType
  if (params.get(P.monthType)) {
    monthType = valid(params.get(P.monthType), ['first_month', 'normal_month'], DEFAULT_STATE.monthType)
  } else if (isLegacyBranded) {
    monthType = 'first_month'
  }

  // Determine inboxOwnership — legacy user_domains_instantly maps to user_domains
  const inboxParam = isLegacyInstantly ? 'user_domains' : params.get(P.inbox)
  const inboxOwnership = isLegacyBranded && !params.get(P.inbox)
    ? 'user_domains'
    : valid(inboxParam, ['dfy', 'user_domains'], DEFAULT_STATE.inboxOwnership) as InboxOwnership

  return {
    monthType,
    leadsPerMonth: (() => {
      const n = Number(params.get(P.leads))
      return !isNaN(n) && n >= 2000 && n <= 50000 ? Math.round(n / 500) * 500 : DEFAULT_STATE.leadsPerMonth
    })(),
    emailsPerProspect: validNum<EmailsPerProspect>(
      params.get(P.epp),
      [1, 2, 3],
      DEFAULT_STATE.emailsPerProspect
    ),
    inboxOwnership,
    dataSource: valid(
      params.get(P.data),
      ['full_list', 'full_list_validate', 'dfy_scrape', 'directory', 'live_signal', 'multi_platform'],
      DEFAULT_STATE.dataSource
    ),
    enrichments: valid(params.get(P.enrich), ['none', 'standard', 'advanced'], DEFAULT_STATE.enrichments),
    copywriting: valid(params.get(P.copy), ['finalized', 'full_strategy'], DEFAULT_STATE.copywriting),
    campaigns: validNum<CampaignsCount>(params.get(P.camps), [1, 2, 3], DEFAULT_STATE.campaigns),
    replyHandling: valid(
      params.get(P.reply),
      ['none', 'ai_instantly', 'custom_n8n'],
      DEFAULT_STATE.replyHandling
    ),
    support: valid(
      params.get(P.support),
      ['email', 'slack_light', 'slack_full'],
      DEFAULT_STATE.support
    ),
    addOns: {
      linkedin: params.get(P.li) === '1',
      crm: params.get(P.crm) === '1',
      dripSequence: params.get(P.drip) === '1',
      infraManagement: params.get(P.infra) === '1',
      instantlySetup: isLegacyFullDfy || params.get(P.instantly) === '1',
      landingPage: params.get(P.landing) === '1',
    },
    coupon: params.get(P.coupon) ?? '',
    upworkFee: params.get(P.upwork) === '1',
  }
}

export function serializeState(state: SelectionState): string {
  const d = DEFAULT_STATE
  const params = new URLSearchParams()

  if (state.monthType !== d.monthType) params.set(P.monthType, state.monthType)
  if (state.leadsPerMonth !== d.leadsPerMonth) params.set(P.leads, String(state.leadsPerMonth))
  if (state.emailsPerProspect !== d.emailsPerProspect) params.set(P.epp, String(state.emailsPerProspect))
  if (state.inboxOwnership !== d.inboxOwnership) params.set(P.inbox, state.inboxOwnership)
  if (state.dataSource !== d.dataSource) params.set(P.data, state.dataSource)
  if (state.enrichments !== d.enrichments) params.set(P.enrich, state.enrichments)
  if (state.copywriting !== d.copywriting) params.set(P.copy, state.copywriting)
  if (state.campaigns !== d.campaigns) params.set(P.camps, String(state.campaigns))
  if (state.replyHandling !== d.replyHandling) params.set(P.reply, state.replyHandling)
  if (state.support !== d.support) params.set(P.support, state.support)
  if (state.addOns.linkedin) params.set(P.li, '1')
  if (state.addOns.crm) params.set(P.crm, '1')
  if (state.addOns.dripSequence) params.set(P.drip, '1')
  if (state.addOns.infraManagement) params.set(P.infra, '1')
  if (state.addOns.instantlySetup) params.set(P.instantly, '1')
  if (state.addOns.landingPage) params.set(P.landing, '1')
  if (state.coupon) params.set(P.coupon, state.coupon)
  if (state.upworkFee) params.set(P.upwork, '1')

  return params.toString()
}
