/**
 * PRICING CONFIGURATION
 * ─────────────────────
 * Edit values here to update prices.
 * After saving, commit and push to GitHub → Vercel auto-deploys → live in ~30s.
 */

export const PRICING = {
  setup: {
    instantly_setup: 150,  // Instantly account setup add-on (one-time, on top of branded setup)
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
    user_domains: 35,   // $ per 1k emails sent
    dfy:          50,   // $ per 1k emails sent
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
    1: 0,    // one-time (1st experiment included)
    2: 125,  // one-time (+$125 per additional experiment beyond the 1st)
    3: 250,
    4: 375,
    5: 500,
  } as Record<number, number>,

  // Per-additional-experiment price — single source of truth for the flat
  // "$125 per experiment beyond the first" model. The `campaigns` map above is
  // derived from this (n - 1) × pricePerAdditionalExperiment.
  pricePerAdditionalExperiment: 125,

  // Calculator-side package nudge: when total ≥ this, surface the top banner
  // recommending the right package tier. Threshold matches Pilot ($1,500/mo)
  // so the comparison feels apt the moment a one-off crosses that mark.
  packageNudgeThreshold: 1500,

  // Package tier thresholds — drives which tier the banner recommends.
  // total in [pilotMin, growthMin)  → Pilot
  // total in [growthMin, scaleMin)  → Growth
  // total in [scaleMin, ∞)          → Scale
  packageTiers: {
    pilotMin: 1500,
    growthMin: 2450,
    scaleMin: 3450,
  } as const,

  replyHandling: {
    none:         0,    // $ per 1k emails sent
    ai_instantly: 17,   // $ per 1k emails sent
    custom_n8n:   20,   // $ per 1k emails sent
    n8n_setup:    330,  // one-time build fee (added when custom_n8n selected)
  },

  support: {
    email:       100,  // included with every campaign
    slack_light: 200,  // upgrade: 5-day Slack channel
    slack_full:  375,  // upgrade: full Slack + calls
  },

  // Minimum leads the volume slider can drop to (UI floor).
  leadsMin: 1500,

  addOns: {
    linkedin_monthly:  245,  // $/month
    crm_monthly:       97,   // $/month
    drip_onetime:      180,  // one-time setup
    drip_monthly:      120,  // $/month
    infra_management:  25,   // $/1k emails (monthly) — waived if total > $2,000
    landingPage:       350,  // one-time landing page build
  },

  // Support waiver thresholds — support is free when baseTotal meets threshold
  supportWaiverThresholds: {
    email:       500,   // free if baseTotal >= $500
    slack_light: 1000,  // free if baseTotal >= $1,000
    slack_full:  2000,  // free if baseTotal >= $2,000
  },

  // Infra management waiver — waived if baseTotal (without infra) >= this
  infraWaiverThreshold: 2000,

  // Branded domains setup — flat labour fee for spinning up the infrastructure.
  brandedSetup: {
    baseSetupFee: 250,         // flat setup fee for up to extraInboxThreshold inboxes
    extraInboxThreshold: 50,   // above this count, add extraPerInbox per inbox
    extraPerInbox: 2,          // e.g. 100 inboxes → $250 + 50×$2 = $350
  },

  // ── Sending-capacity model (one-off campaign) ────────────────────────────
  // Timeline is a FIXED 6 weeks: 2 weeks inbox warmup (zero sends) followed by
  // 4 weeks of full-capacity sending. NO ramp — after warmup, every inbox sends
  // at full capacity immediately. Inbox count scales to fit the selected email
  // volume into the 4-week sending window.
  capacity: {
    emailsPerInboxPerDay: 27,    // full capacity per inbox per sending day (post-warmup)
    warmupDays: 14,              // 2 weeks of warmup, zero outbound
    sendingWeeks: 4,             // 4 weeks of full-capacity sending
    sendingDaysPerWeek: 5,       // weekdays only
    inboxesPerDomain: 3,         // inboxes provisioned per sending domain
    backupDomainPerEmails: 5000, // +1 backup domain (3 inboxes) per 5k total emails — failover buffer
    weekdaysPerMonth: 22,        // for the "monthly system capacity" side-note only
  },

  // ── Branded sending infrastructure folded INTO the campaign total ────────
  // The client keeps these assets: domains registered for a full year + inboxes
  // hosted for `monthsIncluded` months. This is added to the total and is NOT
  // discounted (volume discount + coupons apply only to campaign services).
  // Presented as an included bonus ("yours to keep"), broken out on demand.
  infraIncluded: {
    domainCostPerYear: 12,   // $/domain — 1-year registration
    monthsIncluded: 2,       // months of inbox hosting bundled into the campaign price
    // Inbox monthly rate is volume-tiered (cheaper at scale) — see inboxMonthlyRate().
    inboxRateBase: 3.50,     // < 30 inboxes
    inboxRateMid: 3.25,      // ≥ 30 inboxes
    inboxRateHigh: 3.00,     // ≥ 100 inboxes
  },

  hourlyRate: 37,  // Additional work rate (displayed as a note)
} as const
