/**
 * PRICING CONFIGURATION
 * ─────────────────────
 * Edit values here to update prices.
 * After saving, commit and push to GitHub → Vercel auto-deploys → live in ~30s.
 */

export const PRICING = {
  setup: {
    full_dfy: 400,      // Full DFY Instantly system setup (one-time)
    branded_only: 250,  // Branded domains/inboxes only (one-time)
  },

  // Volume discounts applied to all per-1k variable costs
  volumeDiscounts: {
    2000:  0,
    4000:  0.05,    // 5% off
    7500:  0.075,   // 7.5% off
    10000: 0.10,    // 10% off
    20000: 0.20,    // 20% off
    40000: 0.25,    // 25% off
  } as Record<number, number>,

  inboxOwnership: {
    user_domains:           35,   // $ per 1k emails sent
    user_domains_instantly: 30,   // $ per 1k emails sent
    dfy:                    85,   // $ per 1k emails sent
  },

  dataSource: {
    full_list:          20,   // $ per 1k leads
    full_list_validate: 35,   // $ per 1k leads
    dfy_scrape:         50,   // $ per 1k leads
    directory:          60,   // $ per 1k leads
    live_signal:        100,  // $ per 1k leads
    multi_platform:     150,  // $ per 1k leads
  },

  enrichments: {
    none:     0,    // $ per 1k leads
    standard: 27,   // $ per 1k leads
    advanced: 40,   // $ per 1k leads
  },

  copywriting: {
    finalized:     50,   // one-time
    full_strategy: 125,  // one-time
  },

  campaigns: {
    1: 0,    // one-time
    2: 220,  // one-time
    3: 400,  // one-time
  } as Record<number, number>,

  replyHandling: {
    none:         0,    // $ per 1k emails sent
    ai_instantly: 20,   // $ per 1k emails sent
    custom_n8n:   20,   // $ per 1k emails sent
    n8n_setup:    330,  // one-time build fee (added when custom_n8n selected)
  },

  support: {
    email:       75,   // $ per campaign duration
    slack_light: 125,  // $ per campaign duration
    slack_full:  225,  // $ per campaign duration
  },

  addOns: {
    linkedin_monthly:  245,  // $/month
    crm_monthly:       97,   // $/month
    drip_onetime:      180,  // one-time setup
    drip_monthly:      120,  // $/month
    infra_management:  25,   // $/1k emails (monthly) — waived if total > $2,000
  },

  // Support waiver thresholds — support is free when baseTotal meets threshold
  supportWaiverThresholds: {
    email:       500,   // free if baseTotal >= $500
    slack_light: 1000,  // free if baseTotal >= $1,000
    slack_full:  2000,  // free if baseTotal >= $2,000
  },

  // Infra management waiver — waived if baseTotal (without infra) >= this
  infraWaiverThreshold: 2000,

  hourlyRate: 37,  // Additional work rate (displayed as a note)
} as const
