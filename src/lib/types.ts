export type SetupOption = 'none' | 'full_dfy' | 'branded_only'
export type LeadsPerMonth = number
export type EmailsPerProspect = 1 | 2 | 3
export type InboxOwnership = 'user_domains' | 'user_domains_instantly' | 'dfy'
export type DataSource =
  | 'full_list'
  | 'full_list_validate'
  | 'dfy_scrape'
  | 'directory'
  | 'live_signal'
  | 'multi_platform'
export type Enrichments = 'none' | 'standard' | 'advanced'
export type CopywritingOption = 'finalized' | 'full_strategy'
export type CampaignsCount = 1 | 2 | 3
export type ReplyHandling = 'none' | 'ai_instantly' | 'custom_n8n'
export type SupportTier = 'email' | 'slack_light' | 'slack_full'

export interface AddOns {
  linkedin: boolean
  crm: boolean
  dripSequence: boolean
  infraManagement: boolean
}

export interface SelectionState {
  setup: SetupOption
  leadsPerMonth: LeadsPerMonth
  emailsPerProspect: EmailsPerProspect
  inboxOwnership: InboxOwnership
  dataSource: DataSource
  enrichments: Enrichments
  copywriting: CopywritingOption
  campaigns: CampaignsCount
  replyHandling: ReplyHandling
  support: SupportTier
  addOns: AddOns
  coupon: string
}

export interface LineItem {
  label: string
  amount: number
  type: 'fixed' | 'variable' | 'addon'
  period: 'one-time' | 'monthly' | 'per-campaign'
}

export interface PricingResult {
  lineItems: LineItem[]
  fixedSubtotal: number
  variableSubtotalBeforeDiscount: number
  variableSubtotal: number
  addonSubtotal: number
  discountAmount: number
  discountPercent: number
  total: number
  totalEmails: number
  baseTotal: number        // total before support cost (used for support waiver logic)
  supportIsFree: boolean
  supportThreshold: number // threshold that triggered the waiver (0 if not free)
  couponDiscountAmount: number
  couponDiscountPercent: number
}
