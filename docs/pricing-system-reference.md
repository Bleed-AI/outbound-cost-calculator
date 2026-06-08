# BleedAI Pricing — System Reference

> **Purpose**: operational reference for everything *mechanical* about the pricing system — defaults, thresholds, file map, validation, and the design decisions baked into the calculator code.
>
> For *who* gets which link and *why* (routing thinking), see [`pricing-philosophy.md`](./pricing-philosophy.md). This doc answers "where is X encoded?" not "should we offer X?".
>
> **Last updated**: 2026-06-03.

---

## 1. Three products at a glance

| Product | URL | Price range | Live source of truth |
|---|---|---|---|
| Cost Calculator (One-Time Campaigns) | `/` | ~$733 floor → ~$8,445 ceiling | `src/lib/pricing.config.ts` + `src/lib/pricing.ts` |
| Trial Campaigns | `/trials` | $350 → $1,100 | `src/components/TrialsView.tsx` |
| Managed Outbound Packages | `/packages` | $1,500/mo → $3,450/mo | `src/components/PackagesView.tsx` |

---

## 2. Calculator defaults

Validated against `scripts/validate-pricing.ts` as of 2026-06-03.

### Locked invisible defaults (no UI to change)

| Field | Value | Why locked |
|---|---|---|
| `monthType` | `first_month` | Single-campaign math only; no ongoing-month complexity |
| `inboxOwnership` | `user_domains` (branded) | We do not offer shared infra anymore |
| Reply handling | `ai_instantly` | Always on; not a choice |

### Surfaced defaults (visible in main UI)

| Field | Default | Min / Max |
|---|---|---|
| Lead volume | 4,000 | 1,500 (lowered from 2,000) / 50,000 |
| Emails per prospect | 2 | 1 / 3 (2 carries "Recommended" badge) |
| Campaign experiments | 1 (first included) | 1 / 5 (+$125 per additional) |

### Defaults hidden in Advanced Options

| Field | Default | Note |
|---|---|---|
| Data source | `dfy_scrape` ($50/1k) | Most generic-applicable |
| Enrichments | `standard` | |
| Copywriting | `full_strategy` ($125 one-time) | |
| Support | `slack_light` ($200/mo) | Switched from `email` ($100) — Slack signals real engagement |

### Add-ons (all unchecked by default, in Advanced Options)

| Add-on | Price |
|---|---|
| LinkedIn Connection Requests | $245/mo |
| CRM Integration | $97/mo |
| Custom Drip Sequence | $180 setup + $120/mo |
| Infrastructure Mgmt & Domain Rotation | $25/1k emails (auto-waived when subtotal ≥ $2,000) |
| Instantly Account Setup | $150 one-time |
| Landing Page Build | $350 one-time |

### Setup baseline

- Branded Domains & Inboxes setup: **$250** baseline + **$2 per extra inbox above 50 inboxes**.

---

## 3. Reference configurations

Outputs from the validation harness (`npx tsx scripts/validate-pricing.ts`):

| Config | Total | Notes |
|---|---|---|
| Floor: 1,500 leads × 1 EPP × 1 campaign | ~$733 | Min volume |
| Default: 4,000 × 2 × 1 | ~$1,263 | Just below the $1,500 package nudge threshold |
| Mid: 10,000 × 2 × 1 | ~$2,204 | Banner suggests Growth |
| High: 20,000 × 2 × 1 | ~$3,531 | Banner suggests Scale |
| Ceiling: 40k × 3 × 5 experiments | ~$8,445 | At this point: route to Scale package |

---

## 4. Trial Campaigns pricing

| Package | Default (`?p=high`, public) | Discounted (`?p=low`, gated) | Duration cap |
|---|---|---|---|
| 1-2 Trial Campaigns | **$580** | **$350** | up to 2 weeks |
| 3-5 Trial Campaigns | **$1,100** *(emphasized)* | **$900** | up to 4 weeks |

**Tier toggle on `/trials`**:

- URL param: `?p=high` (default, public) or `?p=low`
- Hidden footer dot (visible but unlabeled)
- Keyboard shortcut: `Shift+P` cycles tiers

The low tier is operator-controlled — never advertised. See [`pricing-philosophy.md`](./pricing-philosophy.md) for the routing rule on when to share the `?p=low` URL.

A mid tier was tried and removed — no psychological purpose.

---

## 5. Packages pricing

| Tier | Price | Email volume | Differentiator |
|---|---|---|---|
| Pilot | $1,500/mo | up to 10k emails/mo | Entry tier, no monthly experimentation, email support |
| Growth (emphasized) | $2,450/mo | 20k–30k emails/mo | Multiple experiments + new market testing + Slack 5 days/wk |
| Scale | $3,450/mo | 50k–60k OR extra experiments | Advanced reverse leadmagnets + signal-based campaigns |

A fourth tier (~$5,450 Premier) was tried and dropped — at that level, custom enterprise sales work better than a packaged tier.

---

## 6. Volume discounts and coupons

### Volume discounts (variable costs only)

| Threshold | Discount |
|---|---|
| 4,000 leads | 5% |
| 7,500 leads | 7.5% |
| 10,000 leads | 10% |
| 20,000 leads | 20% |
| 40,000 leads | 25% |

### Coupon codes (internal — never public)

Applied via `?cp=CODE` in calculator URL. Defined in `src/lib/pricing.ts → COUPON_CODES`.

| Code | Discount |
|---|---|
| NEW5 | 5% |
| SPECIAL10 | 10% |
| VIP15 | 15% |
| ULTRA20 | 20% |
| PLATINUM25 | 25% |
| DIAMOND33 | 33% |

Handed out via personalized links. Never posted publicly.

---

## 7. Banner thresholds (tier-aware nudge)

The top banner on `/` fires when calculator total ≥ $1,500 and recommends the tier whose monthly price is *just below* the user's current one-off total:

| Calculator total | Banner recommends |
|---|---|
| ≥ $3,450 | Scale |
| ≥ $2,450 | Growth |
| ≥ $1,500 | Pilot |

Defined in `src/lib/pricing.config.ts → packageTiers` and `src/components/TopBannerNudge.tsx → recommendedTier()`.

Banner is sticky (follows scroll) and dismissable per session (sessionStorage). Once dismissed it does not reappear that session.

---

## 8. The 15 psychological design decisions

Each is a guardrail baked into the calculator code. Changing the calculator without considering these undoes intent.

### 8.1 Bill on full volume, not ramp

Originally we billed for ramp-phase sends only. Switched to full-volume billing because:

- Customer hears "I'm buying 4,000 leads" and expects 4,000 emails to go out.
- Charging only for ramp (~3,360 of 8,000 emails) silently breaks that expectation.
- Honest pricing scales by ~25% but the customer trusts the math.

The 4-phase timeline on the calculator (1 day setup + 14 days warmup + 15 days ramp + steady-state until full volume sent, ~40 days total) surfaces exactly when emails go out.

### 8.2 Slack support is the default ($200/mo)

Email support ($100) was the original default. Switched because email = no real iteration; for real engagement during a campaign you need same-day Slack. Defaulting to Email signaled no-touch. $200 is the cost of "we're available when you need us".

### 8.3 Package nudge fires at $1,500 (not $2,200)

Threshold matches Pilot price. Below $1,500 the "what about monthly?" pitch does not carry. At $1,500 the comparison is apt for the first time. Above $1,500 the customer is already in "I could be running this every month for less" territory.

### 8.4 Banner is tier-aware

We recommend the *right* tier based on the user's current total, not always the same one. Each tier has its own tagline so the message reads as a relevant comparison, not a generic upsell.

### 8.5 "Premium" branding killed → "Managed Outbound" used instead

We do not say premium; we show it through scope. "Managed Outbound Packages" describes the actual deliverable (we run it for you), reads professional, no hyperbole.

### 8.6 "Trial Campaigns" not "Experiments" for the customer-facing product

A/B testing of hooks, subject lines, and offer angles is *included in every single campaign*. When we use "experiments" customer-side, we mean **parallel testing of fundamentally different ICPs or market segments**. The Campaign Experiments section description spells this out so customers do not undervalue what they are buying.

### 8.7 1-2 vs 3-5 trial differentiation

- 1-2 Trials (2 weeks, $580 / $350): clear ICP hypothesis. "Validate fast and confirm signal."
- 3-5 Trials (4 weeks, $1,100 / $900, emphasized): uncertain fit or multiple market hypotheses. "Higher chance of finding a winner."

3-5 is visually emphasized because it is the better conversion path to packages.

### 8.8 Trial and package CTAs use order language, not booking language

- Trial cards: "Start Your Trial"
- Package cards: "Get Started"
- Modal title and submit: "Place Order & Continue" / "Send Order & Continue"
- Email subject: "Your {kind} Order — {tier}"

The CTA does not change what happens (click still goes to a Calendly kickoff call) — it changes the prospect's frame from "exploring options" to "decision made". Higher conversion rate on the kickoff call.

### 8.9 No Stripe — manual invoice for now

The order form captures **commitment intent**, not transaction. The kickoff call is where we final-qualify. Manual invoice goes out after the call confirms fit. Will automate once conversion volume and repeatability justify it.

### 8.10 Secret price toggle on /trials

Public default = high tier ($580 / $1,100). Low tier ($350 / $900) reached via URL param, hidden footer dot, or `Shift+P`. Discoverable to operators, not advertised to public. Avoids fairness problem of prospects comparing notes.

### 8.11 Hide complexity behind Advanced Options

Original calculator exposed 13 sections of configurable choice. Buyers froze. Current UI surfaces 3 sections (Lead Volume, Emails per Prospect, Campaign Experiments) and folds the rest into a single Advanced Options panel. Smart defaults cover ~80% of buyers.

### 8.12 Drop monthly framing from one-off calculator

The one-off campaign runs once over ~40 days. Earlier the breakdown said "$X/mo" on most line items — this was a fiction. Removed the `/mo` suffix on calculator. Internal grouping (`Campaign Costs` vs `Setup Fees`) is still useful. Total reads as a one-time charge.

### 8.13 "Select Companies" note on calculator

Below the trial CTA on the calculator: *"Note: We only run Trial Campaigns for select companies."* Operationally true; also signals scarcity, implies vetting, and prevents calculator buyers from feeling like the trial path is the cheap option they are missing out on.

### 8.14 Eligibility nudge is dismissable and sticky

Sticky (follows scroll), dismissable (X button), and respects sessionStorage so it does not reappear after dismissal. Respects user agency vs aggressive popup behavior.

### 8.15 "What You Get" list is rich, not minimal

The Calculator's "What You Get" section surfaces 9 deliverables (was 6) — pulled from the campaign-manager project to be accurate:

1. Branded sending infrastructure (with inbox + domain count, setup fee)
2. Full DFY lead discovery (LinkedIn Sales Nav + Apollo + Google Maps + niche directories)
3. 4-provider email-finding waterfall (TryKit + LeadMagic + FindyMail + internal)
4. Decision-maker identification
5. AI personalization on every lead
6. Full copy strategy (subject lines, hooks, sequences, A/B variants, spam-blacklist filtered)
7. AI reply agent
8. Campaign launch on Instantly with AI inbox placement
9. Email support throughout

Goal: customer feels the campaign price is a steal for what is included. Don't undersell scope.

---

## 9. Stop conditions for trials

Trials end when one of three things happens. We control the stop — customer does not bear ongoing volume cost.

1. **Win**: meaningful traction (positive replies, booked meetings, qualified leads). → Convert to a monthly package on the kickoff call for the next phase.
2. **Determined no-fit**: multiple weeks in, no signal. Cold email is not right for this business. → Honest debrief. Route to one-off Calculator as a contained alternative if appropriate.
3. **Time-up**: 1-2 capped at 2 weeks; 3-5 capped at 4 weeks. Stop on schedule even with mixed signal. → Discuss next steps: extend (separate commercial agreement), convert, or close.

**Why time caps**: trials are unit-cost loss-leaders. Indefinite runs erode unit economics fast. Caps protect both sides and create urgency in the post-trial conversion conversation.

---

## 10. Sales workflow — what is automated vs manual

| Step | Calculator | Trials | Packages |
|---|---|---|---|
| Lead enters | Public landing `/` | Public landing OR personal link | Public landing OR post-trial conversion |
| Prospect qualifies | n/a (anyone) | Pre-call screen by sales | Post-trial conversion or pre-call screen |
| Pricing shown | Live calculator | High tier default; `?p=low` only via personal link | All 3 tiers visible |
| Form fill | `OrderModal` | `InquiryModal` (kind=trial) | `InquiryModal` (kind=package) |
| Payment | Manual invoice (Stripe TBD) | Manual invoice | Manual invoice |
| Owner notification | `owner@bleedai.com` via Resend | Same | Same |
| Calendly | `/pilot-campaign-launch` | `bleedai.com/book-call/` | `bleedai.com/book-call/` |
| Email subject | "Your BleedAI Campaign Proposal" | "Your Trial Campaign Order — {tier}" | "Your Managed Outbound Package Order — {tier}" |

Sales workflow assumes:

- Pre-call qualification (LinkedIn, ICP, ACV signals) before sending a low-price trial link.
- Kickoff call confirms fit and finalizes invoice.
- Manual invoice goes out after the call.
- Conversion to a package is a separate sales conversation post-trial.

---

## 11. What we explicitly chose NOT to do

| Decision | Why we said no |
|---|---|
| Take Stripe payments on the site | Wrong-fit customer commits before qualification. The sales call IS the qualification mechanism. Automate later once conversion volume + repeatability is proven. |
| "Retainer" word in customer copy | Reads heavier than the actual Pilot ($1,500) commitment. "Package" sets the right expectation. |
| "Premium" branding | Cheesy without earning it. Show through scope, do not say. |
| Force trial path on every package visitor | Some visitors arrive ready to commit. Forcing them through trials wastes their time and our conversion. Soft suggestion only. |
| Public discount codes | Coupons exist but only via personal URL. Posting publicly destroys their meaning. |
| Mid pricing tier on trials | High (default) + low (Cat 1 only) is enough. A mid tier was a midpoint without psychological purpose — dropped. |
| Show every config option upfront | 13 sections paralysed buyers. Smart defaults + Advanced Options solves it. |
| Tier-blind banner ("always Growth") | At a $1,500 customer total, recommending Growth ($2,450) does not make sense. Tier-aware is honest. |
| Monthly $/mo framing on one-off calculator | Campaign runs once over ~40 days. "$X/mo" is a fiction. Single total reads honest. |
| Ramp-only billing | Customer thinks they are buying N leads; charging for fewer sent is silent deception. Bill full volume. |

---

## 12. Where this is encoded in code

| File | What it locks |
|---|---|
| `src/lib/pricing.config.ts` | All prices, thresholds, package tier minimums, nudge threshold, volume discounts, support tiers, add-ons, warmup math |
| `src/lib/pricing.ts` | `DEFAULT_STATE`, `calculateTotal`, `computeCampaignPhases`, `COUPON_CODES`, `LEADS_OPTIONS`, `CAMPAIGNS_OPTIONS` |
| `src/lib/types.ts` | `SelectionState` shape, type constraints |
| `src/lib/url-state.ts` | URL ↔ state serialization (short param keys) + backward-compat for legacy URLs |
| `src/components/TopBannerNudge.tsx` | Tier-aware recommendation (`recommendedTier`) + dismissal/sticky logic |
| `src/components/HomeShell.tsx` | Lifted state so banner sits above the header |
| `src/components/Calculator.tsx` | Force-locks invisible fields; honours URL state for visible ones |
| `src/components/sections/CampaignsSection.tsx` | Campaign Experiments vs A/B testing copy |
| `src/components/sections/CampaignSetupSummary.tsx` | "Included In Your Campaign" 9-item list + 4-phase timeline |
| `src/components/sections/AdvancedOptionsDisclosure.tsx` | Houses all hidden defaults + add-ons |
| `src/components/TrialsView.tsx` | Trial pricing tiers, positioning, secret toggle |
| `src/components/PackagesView.tsx` | Three package tiers + scope + journey explainer |
| `src/components/InquiryModal.tsx` | Order-language CTAs per inquiry kind |
| `src/components/OrderModal.tsx` | Calculator one-off order form |
| `src/components/Header.tsx` | Hero copy per page variant (calculator / trials / packages) |
| `src/app/api/send-inquiry/route.ts` | Email subject + body per inquiry kind |
| `src/app/api/send-order/route.ts` | Calculator order email |
| `scripts/validate-pricing.ts` | Validation harness — run after price changes |

---

## 13. Validation

After any change to `pricing.config.ts`, `pricing.ts`, or `url-state.ts`:

```bash
npx tsx scripts/validate-pricing.ts
npm run build
```

The validation harness exercises floor / typical / ceiling configs, all 5 campaign experiment counts, all 6 coupon codes, and 6 legacy URL backward-compat patterns. Fix any ✗ before pushing.

---

## See also

- [`pricing-philosophy.md`](./pricing-philosophy.md) — short routing brain (who gets which link and why).
- [`pricing-learnings.md`](./pricing-learnings.md) — central, evolving log of how pricing thinking changes over time (the *why/when* behind revisions to this doc).
- `CLAUDE.md` (repo root) — links to both docs at the top.

---

## Revision log

- **2026-06-03** — Initial extraction from the previous `pricing-philosophy.md`. System-mechanics content (defaults, decisions, file map, workflow tables, validation) moved here so the philosophy doc can stay short and routing-focused.
