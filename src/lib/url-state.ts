import { DEFAULT_STATE } from './pricing'
import type { SelectionState, EmailsPerProspect, CampaignsCount } from './types'

type SearchParamsLike = { get: (key: string) => string | null }

const P = {
  setup: 's',
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
  coupon: 'cp',
} as const

function valid<T extends string>(val: string | null, allowed: T[], fallback: T): T {
  return val !== null && (allowed as string[]).includes(val) ? (val as T) : fallback
}

function validNum<T extends number>(val: string | null, allowed: T[], fallback: T): T {
  const n = Number(val)
  return !isNaN(n) && (allowed as number[]).includes(n) ? (n as T) : fallback
}

export function parseState(params: SearchParamsLike): SelectionState {
  // Legacy: map old 'full_dfy' URLs to branded_only + instantlySetup
  const rawSetup = params.get(P.setup)
  const isLegacyFullDfy = rawSetup === 'full_dfy'

  return {
    setup: isLegacyFullDfy ? 'branded_only' : valid(params.get(P.setup), ['none', 'branded_only'], DEFAULT_STATE.setup),
    leadsPerMonth: (() => {
      const n = Number(params.get(P.leads))
      return !isNaN(n) && n >= 2000 && n <= 50000 ? Math.round(n / 500) * 500 : DEFAULT_STATE.leadsPerMonth
    })(),
    emailsPerProspect: validNum<EmailsPerProspect>(
      params.get(P.epp),
      [1, 2, 3],
      DEFAULT_STATE.emailsPerProspect
    ),
    inboxOwnership: valid(
      params.get(P.inbox),
      ['user_domains', 'user_domains_instantly', 'dfy'],
      DEFAULT_STATE.inboxOwnership
    ),
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
    instantlySetup: isLegacyFullDfy || params.get(P.instantly) === '1',
    addOns: {
      linkedin: params.get(P.li) === '1',
      crm: params.get(P.crm) === '1',
      dripSequence: params.get(P.drip) === '1',
      infraManagement: params.get(P.infra) === '1',
    },
    coupon: params.get(P.coupon) ?? '',
  }
}

export function serializeState(state: SelectionState): string {
  const d = DEFAULT_STATE
  const params = new URLSearchParams()

  if (state.setup !== d.setup) params.set(P.setup, state.setup)
  if (state.leadsPerMonth !== d.leadsPerMonth) params.set(P.leads, String(state.leadsPerMonth))
  if (state.emailsPerProspect !== d.emailsPerProspect) params.set(P.epp, String(state.emailsPerProspect))
  if (state.inboxOwnership !== d.inboxOwnership) params.set(P.inbox, state.inboxOwnership)
  if (state.dataSource !== d.dataSource) params.set(P.data, state.dataSource)
  if (state.enrichments !== d.enrichments) params.set(P.enrich, state.enrichments)
  if (state.copywriting !== d.copywriting) params.set(P.copy, state.copywriting)
  if (state.campaigns !== d.campaigns) params.set(P.camps, String(state.campaigns))
  if (state.replyHandling !== d.replyHandling) params.set(P.reply, state.replyHandling)
  if (state.support !== d.support) params.set(P.support, state.support)
  if (state.instantlySetup) params.set(P.instantly, '1')
  if (state.addOns.linkedin) params.set(P.li, '1')
  if (state.addOns.crm) params.set(P.crm, '1')
  if (state.addOns.dripSequence) params.set(P.drip, '1')
  if (state.addOns.infraManagement) params.set(P.infra, '1')
  if (state.coupon) params.set(P.coupon, state.coupon)

  return params.toString()
}
