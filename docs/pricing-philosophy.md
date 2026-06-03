# BleedAI Pricing & Customer Routing — Source of Truth

This doc is the canonical reference for how BleedAI prices cold outreach services and routes customers to the right product. It captures the *why* behind every threshold, tier, and copy decision in the live calculator (`calculator.bleedai.com`), so future work on this project — and other BleedAI projects — can apply the same thinking.

**Audience**: anyone working on BleedAI sales, marketing, fulfillment, or product. Read once, refer back when you need to understand a pricing decision or extend the model to a new offering.

**Authored from**: `Outbound_Cost_Calculator`. The calculator is the operational expression of this thinking; this doc is the model behind it. Last revised: 2026-06-03.

> **Mental model in one line:** we sell three products to three audiences with three different psychologies — Calculator for the decided one-off buyer, Trials for the unsure prospect, Packages for the committed client. Each product locks down the right copy, defaults, price points, and CTAs for its audience.

---

## 1. Product line — three offerings, three customer paths

| Product | URL | Price range | Audience | What we deliver |
|---|---|---|---|---|
| **Cost Calculator (One-Time Campaigns)** | `/` | ~$733 – ~$8,445 | Customers who've already decided they want cold outbound and need a one-off send | End-to-end single campaign — branded infra setup, lead sourcing, copy, sends, reply handling |
| **Trial Campaigns** | `/trials` | $350 – $1,100 | Prospects unsure if cold outbound works for their business — want to validate first | Parallel campaign experiments on our pre-warmed accounts; we stop on signal (win or determine no-fit) |
| **Managed Outbound Packages** | `/packages` | $1,500 – $3,450/mo | Clients ready to commit to ongoing scaled outbound | Monthly package — full ops, ongoing experiments, scaling winners |

### Why three products and not one

A single calculator would muddy three different psychologies:

- **Calculator buyer** wants transparent unit economics. They know what they want — show every line item.
- **Trial buyer** doesn't know yet if outbound will work for them. Volume math doesn't move them; low-risk validation does.
- **Package buyer** is committing to a relationship. Doesn't care about per-1k rates — cares about scope, ops, and what's included.

Separating these lets each surface speak its audience's language.

---

## 2. Customer segmentation — Types & Gates

Internal framework for deciding which product to route a given prospect to. Not customer-facing.

### Three customer types

**Customer Type 1: Decided one-off buyer**
- Already convinced cold outbound is right for them
- Has some budget for a single campaign
- Wants transparent pricing + end-to-end delivery
- **Public landing**: `/` (Cost Calculator)
- **Not our ideal long-term segment** but still convertible volume

**Customer Type 2: Try-before-commit prospect**
- Not yet convinced — wants to test the market first
- Three sub-flavors based on three qualification gates (below)
- **Public landing**: `/trials`
- **Ideal long-term**: convert to a monthly package after trial

**Customer Type 3: Bad-fit prospect**
- B-fit absent: business model doesn't suit cold outbound (low ACV, B2C, no existing customers, etc.)
- C-fit absent: won't commit to ongoing engagement even if validated
- → Route to `/` as a one-off buyer (Type 1 flow) — sell them what they can buy, don't waste loss-leader trial pricing on them
- → If B is **strongly** negative, even decline to do trials regardless of C — protect our infrastructure reputation

### Three qualification gates (apply to Type 2 prospects)

| Gate | Definition | Where it's checked |
|---|---|---|
| **A — Budget** | Company size + founder budget can sustain monthly retainer ($1,500+/mo) | LinkedIn pre-call, confirmed on call |
| **B — Cold email fit** | Business model suits outbound: high ACV (typically $3k+), B2B, existing customer base, hasn't properly run cold email yet | Pre-call research + ICP analysis |
| **C — Retainer/package commitment** | Willing to commit to monthly engagement after a successful trial | Call only (judgment call) |

### Routing matrix

Within Type 2 prospects, route based on gate combinations:

| Gate fit | Internal category | Trial pricing tier | Where to send them |
|---|---|---|---|
| **A + B + C** (all strong) | **Cat 1** — loss leader | `/trials?p=low` ($350 / $900) | Best-fit prospects we want to convert. Personal URL only. |
| A + strong B + soft C | Cat 2a | Default high tier ($580 / $1,100) | Public landing OR personal URL |
| A + weak B + firm C | Cat 2b | Default high tier ($580 / $1,100) | Public landing OR personal URL |
| A + B strong + no C confirmation | Edge case | High tier (or custom) | Judgment call |
| **B absent or strongly negative** | **Cat 3** (= Type 1) | N/A | Calculator only. No trials. |

**Operational rule**: the `?p=low` URL is only handed to prospects we've categorised as Cat 1 — best-fit prospects we want as long-term clients. Public default is high price. This protects unit economics on Cat 2 and prevents fairness complaints from prospects comparing notes.

---

## 3. Price points — what we charge and why

### Calculator (one-time campaigns)

Validated configs as of 2026-06-03 (validation harness: `scripts/validate-pricing.ts`):

| Config | Total | Notes |
|---|---|---|
| Floor (1,500 leads × 1 EPP × 1 campaign) | ~$733 | Min volume; setup overhead drives floor |
| Default (4,000 × 2 × 1) | ~$1,263 | Most common config — just below the package nudge threshold |
| Mid (10,000 × 2 × 1) | ~$2,204 | Above package nudge ($1,500); banner suggests Pilot/Growth |
| High (20,000 × 2 × 1) | ~$3,531 | Banner suggests Growth/Scale |
| Ceiling (40k × 3 × 5) | ~$8,445 | Big one-off — almost always means this client should be on Scale package |

**Defaults that drive everything** (locked or pre-selected):
- Volume slider min: **1,500 leads** (lowered from 2,000 — accessibility for smaller customers)
- Emails per prospect: **2** (recommended)
- Campaign experiments: **1** (first included; +$125/each additional, 1-5)
- Inbox ownership: **branded (`user_domains`)** — locked, no UI
- Lead data: **DFY scrape** — most generic-applicable
- Reply handling: **AI Instantly** — locked, always on
- Support: **Standard Slack at $200/mo** (was Email default — Slack signals real engagement)
- Setup: Branded Domains & Inboxes setup ($250 baseline + $2/extra-inbox above 50)

**Add-ons** (in Advanced Options, all unchecked by default):
- LinkedIn Connection Requests: $245/mo
- CRM Integration: $97/mo
- Custom Drip Sequence: $180 setup + $120/mo
- Infrastructure Management & Domain Rotation: $25/1k emails (waived when total ≥ $2,000)
- Instantly Account Setup: $150 one-time
- Landing Page Build: $350 one-time

**Volume discounts** (variable costs only):
- 4k leads → 5% · 7.5k → 7.5% · 10k → 10% · 20k → 20% · 40k → 25%

**Coupon codes** (in `pricing.ts → COUPON_CODES`, applied via URL `?cp=`):
- NEW5 = 5% · SPECIAL10 = 10% · VIP15 = 15% · ULTRA20 = 20% · PLATINUM25 = 25% · DIAMOND33 = 33%
- These are **internal** — handed to specific prospects via personalized link. Never posted publicly.

### Trial Campaigns

Two packages, two pricing tiers each (mid tier was removed — no psychological purpose):

| Package | Default (`?p=high`, public) | Discounted (`?p=low`, Cat 1 only) | Duration cap |
|---|---|---|---|
| 1-2 Trial Campaigns | **$580** | **$350** | up to 2 weeks |
| 3-5 Trial Campaigns | **$1,100** | **$900** | up to 4 weeks |

**Why max ~$1,100**: keeps the entire trial under one month of even our cheapest package ($1,500 Pilot). Customer reads it as "less than committing to a package for one month" — framed for experimentation, not commitment.

**Why ~40-50% spread between high and low tiers**: high tier needs to be profitable on its own (Cat 2 prospects); low tier is loss-leader (Cat 1 best-fit prospects we WANT to convert). Spread reflects how much margin we sacrifice for conversion potential.

**3-5 trials is visually emphasized** (red border + filled CTA) because it's the better conversion path — more experiments = more data = higher confidence in committing to a package after.

### Managed Outbound Packages

Three tiers, monthly:

| Tier | Price | Email volume | Differentiator |
|---|---|---|---|
| **Pilot** | $1,500/mo | up to 10k emails/mo | Entry-level — one winning campaign on autopilot, no monthly experimentation, email support |
| **Growth** | $2,450/mo *(emphasized)* | 20k–30k emails/mo | + multiple monthly experiments + new market testing + Slack support 5d/wk |
| **Scale** | $3,450/mo | + 50k–60k OR additional experiments | + advanced reverse leadmagnets + signal-based campaigns |

**Why three tiers, not four**: a fourth ~$5,450 tier (Premier/Gold) was tried and dropped. Pricing at that level requires custom enterprise sales, not a packaged tier. Better to surface "let's talk" as the path for ultra-high volume customers.

**Why "package" not "retainer"**: "retainer" reads heavier than the actual Pilot ($1,500) commitment. "Package" sets the right expectation: monthly subscription, not legal-grade engagement.

---

## 4. The psychological decisions

Each numbered decision is a guardrail. If you change the calculator, make sure your change doesn't undo the principle.

### 4.1 Bill on full volume, not ramp

Originally we billed customers for ramp-phase sends only (`inboxes × 210 emails` over a 14-day ramp). Switched to full-volume billing because:
- Customer hears "I'm buying 4,000 leads" and expects 4,000 leads to get emailed
- Charging only for ramp sends (~3,360 of 8,000 emails) silently breaks that expectation
- Honest pricing scales by ~25% but the customer trusts the math

The campaign now takes ~40 days to complete (1 day setup + 14 days warmup + 15 days ramp + steady-state until full volume sent). The 4-phase timeline on the calculator surfaces this so the customer sees exactly when their emails go out.

### 4.2 Slack support is the default ($200/mo)

Email support ($100) was the original default. Switched to Slack because:
- Email = minimal async; nothing actually iterates between us and the client
- For real engagement during a campaign you need same-day Slack
- Defaulting to Email signaled this was a no-touch operation
- $200 is the cost of "we're available when you need us"

Net: every default config is $100 higher, but reads as a real working relationship.

### 4.3 Package nudge fires at $1,500 (not $2,200)

The banner that appears at the top of the calculator suggesting they switch to a monthly package. Threshold matches **Pilot price** ($1,500/mo) because:
- Below $1,500 on a one-off, the "what about monthly?" pitch doesn't carry — they'd be paying more per month for the package
- At exactly $1,500 on a one-off, comparison is apt for the first time
- Above $1,500, the customer is already in "I could be running this every month for less" territory

### 4.4 Banner is tier-aware

We recommend the **right tier** based on the user's current calculator total, not always the same tier:

| Calculator total | Banner recommends |
|---|---|
| ≥ $3,450 | Scale package |
| ≥ $2,450 | Growth package |
| ≥ $1,500 | Pilot package |

Each tier has its own tagline so the message reads as a relevant comparison, not a generic upsell.

### 4.5 "Premium" branding killed — "Managed Outbound" used instead

We don't say premium; we show it through scope. The earlier hero "Our Premium Packages" sounded cheesy and had visual alignment issues. Replaced with "Managed Outbound Packages" — describes the actual deliverable (we run it for you), reads professional, no hyperbole.

### 4.6 "Trial Campaigns" not "Experiments" for the customer-facing product

A/B testing of hooks, subject lines, offer angles is *included in every single campaign* — that's experimentation within a campaign. When we use the word "experiments" customer-side, we mean **parallel testing of fundamentally different ICPs / market segments**. This distinction matters because:
- Customer reads "5 experiments = 5 A/B tests" → undervalues it
- Customer reads "5 experiments = 5 different ICPs tested simultaneously" → understands the bet
- The Campaign Experiments section description spells this out explicitly

### 4.7 1-2 vs 3-5 trial differentiation

- **1-2 Trials** (up to 2 weeks, $580/$350): for prospects with clear ICP hypothesis. "We validate fast and confirm the signal."
- **3-5 Trials** (up to 4 weeks, $1,100/$900, **emphasized**): for prospects with uncertain fit or multiple potential markets. "Higher chance of finding a winner."

The 3-5 card is visually emphasized because it's the better conversion path to packages — more experiments = more data = higher confidence in committing.

### 4.8 Trial CTAs use order language, not booking language

- Trial cards: **"Start Your Trial"** (not "Book a Strategy Call")
- Package cards: **"Get Started"** (not "Book a Strategy Call")
- Modal title: "Start Your Trial" / "Get Started"
- Submit button: "Place Order & Continue" / "Send Order & Continue"
- Success state: "Trial order received — let's launch"
- Email subject: "Your {kind} Order — {tier}"

The CTA doesn't change what actually happens (the click still goes to a Calendly kickoff call), but it changes the **prospect's frame**: from "exploring options" to "decision made." Higher conversion rate on the kickoff call.

### 4.9 No Stripe — manual invoice for now

Despite collecting full prospect details on the order form, no payment is taken. Stripe is intentionally out:
- Wrong-fit customer locked into trial is bad for both sides
- The kickoff call is where we final-qualify
- Manual invoice goes out after the call confirms fit
- Will automate once conversion volume + repeatability justifies it

The order form's purpose is to capture **commitment intent** and give us context before the call. Not transaction.

### 4.10 Secret price toggle on /trials

The default public `/trials` shows high-tier pricing ($580 / $1,100). The low tier ($350 / $900) is reached via:
- URL parameter: `/trials?p=low`
- Hidden footer dot (visible to anyone but unlabeled)
- Keyboard shortcut: **`Shift+P`** cycles tiers

This is a **sales-controlled** price discriminator:
- We send the low URL only to Cat 1 best-fit prospects
- Public prospects see the high price
- Avoids the fairness problem of prospects comparing notes
- Toggle is discoverable to operators (visible dot + shortcut) but not advertised to public

### 4.11 Hide complexity behind Advanced Options

Original calculator exposed 13 sections of configurable choice. Buyers froze. New default UI surfaces **3 sections** (Lead Volume, Emails per Prospect, Campaign Experiments) and folds the rest into a single Advanced Options panel:
- Data source (DFY scrape default)
- Enrichments (Standard default)
- Copywriting (Full Strategy default)
- Reply handling (AI Instantly default)
- Support (Standard Slack default)
- Add-ons (all unchecked)

Smart defaults cover ~80% of buyers. Power users (or specific cases) toggle Advanced Options.

### 4.12 Drop monthly framing from one-off calculator

Earlier the breakdown said "$X/mo" on most line items. For a one-off campaign:
- "Monthly recurring" is a fiction (the campaign runs once over ~40 days)
- The customer's mental model is "total to buy this campaign"
- Internal grouping (`Campaign Costs` vs `Setup Fees`) is still useful but no `/mo` suffix

Result: cleaner breakdown, total reads as a one-time charge ("$X — covers everything in this campaign").

### 4.13 "Select Companies" note on calculator

Below the trial CTA, calculator page reads: *"Note: We only run Trial Campaigns for select companies."*

This is operationally true (we route trials only to Cat 1/2 prospects), but the line also:
- Signals scarcity / curation (psychologically valuable)
- Implies vetting (filters out tire kickers)
- Prevents the calculator buyer from feeling like the trial path is "the cheap option" they're missing out on

### 4.14 Eligibility nudge is dismissable + sticky

The top banner can be dismissed (X). Once dismissed in a session (sessionStorage), it doesn't reappear that session. The banner is `position: sticky` so it follows scroll. Together:
- Once a user actively dismisses, we stop nagging them
- For users who scroll without dismissing, the message stays available
- Respects user agency vs aggressive popup behavior

### 4.15 "What You Get" list is rich, not minimal

The Calculator's "What You Get" section surfaces **9 deliverables** (was 6) — pulled from the campaign-manager project to be accurate:
- Branded sending infrastructure (with inboxes + domains count, setup fee)
- Full DFY lead discovery (LinkedIn Sales Nav + Apollo + Google Maps + niche directories)
- 4-provider email-finding waterfall (TryKit + LeadMagic + FindyMail + internal)
- Decision-maker identification
- AI personalization on every lead
- Full copy strategy (subject lines, hooks, sequences, A/B variants, spam-blacklist filtered)
- AI reply agent
- Campaign launch on Instantly with AI inbox placement
- Email support throughout

Goal: customer feels the campaign price is a **steal** for what's included. Don't undersell scope.

---

## 5. Stop conditions for trials

Trials end when one of three things happens. We control the stop — customer doesn't bear ongoing volume cost.

1. **Win**: We hit meaningful traction (positive replies, booked meetings, qualified leads). → Convert to a monthly package on the kickoff call for the next phase.

2. **Determined no-fit**: Multiple weeks in, no signal. Cold email isn't right for this business. → Honest debrief. Route to one-off Calculator as a contained alternative if appropriate.

3. **Time-up**: 1-2 trial capped at 2 weeks; 3-5 capped at 4 weeks. We stop on schedule even with mixed signal. → Discuss next steps. Either extend (commercial agreement separately), convert, or close.

**Why time caps**: trials are unit-cost loss-leaders. Indefinite runs erode unit economics fast. Caps protect both sides + create urgency in the post-trial conversion conversation.

---

## 6. Sales workflow — what's automated vs manual

| Step | Calculator (Type 1) | Trials (Type 2) | Packages (Type 2 → committed) |
|---|---|---|---|
| Lead enters | Public landing `/` | Public landing OR personal link | Public landing OR post-trial conversion |
| Prospect qualifies | n/a (anyone) | Sales pre-call screen decides Cat 1 vs 2 | Post-trial conversion conversation |
| Pricing shown | Live calculator | High tier default; `?p=low` for Cat 1 | All 3 tiers visible |
| Form fill | OrderModal | InquiryModal (kind=trial) | InquiryModal (kind=package) |
| Payment | Manual invoice (later: Stripe) | Manual invoice | Manual invoice |
| Owner notification | `owner@bleedai.com` via Resend | Same | Same |
| Calendly | `/pilot-campaign-launch` | `bleedai.com/book-call/` | `bleedai.com/book-call/` |
| Email subject | "Your BleedAI Campaign Proposal" | "Your Trial Campaign Order — {tier}" | "Your Managed Outbound Package Order — {tier}" |

Sales workflow assumes:
- Pre-call qualification (LinkedIn, ICP, ACV) before sending a low-price trial link
- Kickoff call confirms fit, finalises invoice
- Manual Stripe invoice goes out after the call
- Conversion to a package is a separate sales conversation post-trial

---

## 7. What we explicitly chose NOT to do

| Decision | Why we said no |
|---|---|
| **Take Stripe payments on the site** | Wrong-fit customer commits before qualification. The sales call IS the qualification mechanism. Automation later, once conversion volume + repeatability is proven. |
| **"Retainer" word in customer copy** | Reads heavier than the actual Pilot ($1,500) commitment. "Package" sets the right expectation. |
| **"Premium" branding** | Cheesy without earning it. Show, don't say. |
| **Force trial path on every package visitor** | Some visitors arrive ready to commit. Forcing them through trials wastes their time and our conversion. Soft suggestion in the intro only. |
| **Public discount codes** | Coupons (NEW5/SPECIAL10/etc.) exist but only via personal URL. Posting them publicly destroys their meaning. |
| **Mid pricing tier on trials** | Two tiers (high default + low for Cat 1) is enough. A mid tier was a midpoint without psychological purpose — dropped. |
| **Show every config option upfront** | 13 sections paralysed buyers. Smart defaults + Advanced Options solves it. |
| **Tier-blind banner** ("always Growth") | At a $1,500 customer total, recommending Growth ($2,450) doesn't make sense. Tier-aware recommendation is honest. |
| **Monthly $/mo framing on one-off calculator** | Campaign runs once over ~40 days. Saying "$X/mo" is a fiction. Single total reads honest. |
| **Ramp-only billing** | Customer thinks they're buying N leads; charging for fewer sent is silent deception. Bill full volume. |

---

## 8. Common objections — how the pricing structure handles them

### "Why is your calculator cheaper than the trial?"
Calculator is a one-off. Trial includes our pre-warmed infra (no setup wait) + multiple parallel experiments across different ICPs + decision-maker identification + a tighter feedback loop. Different scope, different value.

### "Can I see the lowest trial price?"
Public price is the standard. Lower pricing is offered to qualified best-fit prospects after a pre-call screen. *(We don't say this aloud — the toggle is operator-side.)*

### "Can we just run trials forever?"
No — trials have time caps (2 weeks / 4 weeks). Past that, you move to a monthly package OR we end the engagement.

### "Why does the calculator price keep climbing as I add leads?"
Cold email infrastructure scales with volume. The breakdown shows where the money goes — Lead Data ($50/1k), Inbox sending (per 1k), Enrichments, Reply handling. Volume discounts kick in at 4k, 7.5k, 10k, 20k, 40k.

### "Can I skip the trial and go straight to a package?"
Yes — packages page surfaces this option in the intro ("Some clients jump straight in"). The trial path is a soft recommendation, not a gate.

### "What if I want to validate first but not pay $580?"
Trials at the public price are profitable for us. If we lower it, we lose money — we only do that for prospects we believe will convert to a package. If you'd like to be considered for that tier, let's have the qualification call first.

### "Pilot is only $1,500 — why does the calculator cost MORE than Pilot for a single campaign?"
Pilot is monthly recurring with infra amortised. The calculator price is a single one-off — branded domains and setup are amortised over just one campaign. If you're going to keep running campaigns, Pilot is cheaper per send by far. (This IS the eligibility nudge's exact pitch.)

---

## 9. Where this thinking is encoded in code

| File | What it locks |
|---|---|
| `src/lib/pricing.config.ts` | All prices, thresholds, package tier minimums, nudge threshold |
| `src/lib/pricing.ts` | DEFAULT_STATE, calculateTotal, computeCampaignPhases, COUPON_CODES |
| `src/lib/types.ts` | SelectionState shape, type constraints |
| `src/lib/url-state.ts` | URL ↔ state serialization (short param keys), backward-compat for legacy URLs |
| `src/components/TopBannerNudge.tsx` | Tier-aware recommendation logic (`recommendedTier`) |
| `src/components/HomeShell.tsx` | Lifted state for banner-above-header |
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

If you change a price or threshold, the validation harness (`npx tsx scripts/validate-pricing.ts`) confirms the math still holds across floor / typical / ceiling configs.

---

## 10. Applying this thinking to other BleedAI projects

When pricing a new BleedAI offering (CRM, automation builder, master research agent, future products), think in this order:

1. **Who are the three customer types** for this product? (Transactional, exploratory, committed.)
2. **What are the three gates** that qualify the exploratory tier? (Budget, fit, commitment.)
3. **Where's the loss-leader entry point** for best-fit prospects? (Don't post the discount publicly — sales-controlled URL.)
4. **Where's the natural upsell path** from each entry? (One-off → ongoing, trial → package, basic → premium.)
5. **Default pricing for confidence-building**: Slack > Email, recommended > optional, opt-out > opt-in for revenue-positive features.
6. **What language reads honest vs hyperbolic?** ("Package" not "retainer" if commitment is small. Don't say "premium" — show it.)
7. **Where's the manual qualification step?** Don't take Stripe before you're sure you can deliver value.
8. **What's the time cap** on the loss-leader product? Indefinite trials kill unit economics.
9. **What's hidden by default vs surfaced?** Most buyers want fewer choices. Power users get Advanced Options.
10. **Honest math vs convenient math**: bill on what you deliver, not on what's cheap to deliver.

---

## Revision log

- **2026-06-03** — Initial codification. Captures pricing model after 6 rounds of refinement on the calculator project: 3-product split, Pilot/Growth/Scale tiers, full-volume billing, Slack default support, tier-aware $1,500 nudge, secret toggle on trials, order-language CTAs, "Managed Outbound" branding (dropped "Premium").
