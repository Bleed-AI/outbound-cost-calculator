# BleedAI Pricing — Routing Philosophy

> **Purpose**: when someone asks "how much do you charge?" or "what's the next step?", this doc tells you which of our links to send them to and what to say. It is the routing brain — short on purpose.
>
> For underlying system mechanics (defaults, thresholds, file map, validation harness, the psychological design decisions), see [`pricing-system-reference.md`](./pricing-system-reference.md).
>
> **Audience**: any human teammate or AI agent answering pricing questions on BleedAI's behalf.
>
> **Last updated**: 2026-07-13. This thinking will evolve, so keep the date current when you revise.

---

## TL;DR

We have four surfaces. We do not send all of them to everyone.

| Link | URL | Who it is for | Verbal starting price |
|---|---|---|---|
| **The Outbound Sprint** | `calculator.bleedai.com/sprint` | **The default for every fit prospect.** One-time, 6-week proof engagement: up to 8 campaign experiments, written success bar, rolls into Growth. | $2,950 one-time |
| Managed Outbound Packages | `calculator.bleedai.com/packages` | The destination (Growth) for Sprint winners, plus Scale for committed heavy users who want ongoing from day one. | $3,350/mo (Growth) to $5,300/mo (Scale) |
| Cost Calculator | `calculator.bleedai.com/` | Anyone safely. One-off scoping for prospects who are not a long-term fit. | starts under $1k for a basic campaign |
| Trial Campaigns | `calculator.bleedai.com/trials` | **OPERATOR-ONLY as of 2026-07-09.** Removed from all public nav and site references. Never linked, never quoted; the Sprint's secret price toggle replaced its "select company we want to win" job. | (never volunteered) |

**The default for a good-fit prospect is the Sprint link.** Growth ($3,350/mo) is what the Sprint rolls into, but we do not pre-quote that monthly number, it is earned once the Sprint proves value. When the one-time fee is the objection, the fallback is a smaller one-off scoped in the calculator. Calculator is also the catch-all for unfit or "let me scope it myself" prospects. (Pilot, the old $1,500/mo entry tier, was retired 2026-07-13.)

---

## The routing brain

### Step 1 — Read fit in 5 to 10 seconds

Open their company LinkedIn page. Look for:

- **Company page exists with 4-5+ employees visible**, ideally more. This is the primary signal.
- **B2B business model** (not B2C).
- **Product / service category is not over-saturated** — outbound can still cut through.
- Website professionalism is a *weak* signal these days because AI lets anyone look polished. Do not over-weight it.

More employees and stronger signals push the company up the fit ladder. Solo founders or 1-2 person shops are usually not fit.

### Step 2 — Read intent and budget signals

- **Budget-constrained**: "I don't have much budget", "what's the cheapest option", "just trying something small".
- **Proof-first / validating**: "want to test", "prove it works first", "we got burned by an agency before". This is the Sprint's home turf.
- **Committed**: "We're looking to scale outbound", "ongoing program", clear intent to run cold email seriously.

### Step 3 — Route

```
                     IS THE COMPANY FIT?
        (LinkedIn + 4-5+ employees + B2B + non-saturated)
                             |
              +--------------+---------------+
              |                              |
             YES                             NO
              |                              |
       BUDGET / INTENT?                  CALCULATOR
              |                       ("scope your own one-off
   +----------+-----------+            campaign, price computes live")
   |          |           |
 default   committed    "one-time fee
 (incl.    to ongoing    is too much
 proof-      |           right now"
 first)    GROWTH          |
   |       directly      CALCULATOR
 SPRINT    (or Scale)    (scope a smaller
 $2,950                   one-off to budget)
```

### What to actually say

**Fit prospect (default) → Sprint, Growth anchored:**

> "The way we start with almost everyone is The Outbound Sprint: six weeks, one fixed price ($2,950), we map every outbound method and signal relevant to your market and run up to 8 campaign experiments against each other until one wins. We write the success bar together before anything sends, and if it hits, you roll into our monthly Growth program, month to month (we talk numbers once you have seen it work). Everything we build is yours either way: calculator.bleedai.com/sprint"

**Fit + the one-time fee is the objection → a smaller one-off in the calculator:**

> "If the upfront number is the issue right now, you can scope a smaller single campaign to whatever budget works and prove the channel on a contained spend: calculator.bleedai.com/. Once it is working we step you up to the Sprint or straight into a monthly program."

**Fit + clearly committed to ongoing → Growth directly:**

> "Sounds like you already know you want outbound running every month. Growth is $3,350/mo, month to month, multiple experiments tested monthly: calculator.bleedai.com/packages. Happy to walk you through it on a quick call."

**Unfit (small / B2C / saturated / weak LinkedIn) → calculator only:**

> "You can scope a single campaign here: calculator.bleedai.com/. Pick your lead volume and number of experiments — the price updates live. Send over what you'd like to run and we'll take it from there."

**Cold inbound asking "how much?" with no context yet:**

> "Depends on scope. Most companies start with The Outbound Sprint: a 6-week, fixed-price engagement (starts at $2,950) where we run up to 8 cold email experiments and you keep everything we build: calculator.bleedai.com/sprint. If you already know you want it running monthly, our programs start at $3,350/mo: calculator.bleedai.com/packages. Which direction sounds closest?"

---

## Why each product exists

### The Outbound Sprint — the lead offer (first contract)

The paid, bounded proof engagement, and the answer to the two facts that kill deals: buyers cannot commit to "another monthly payment" for an unproven channel, and a retainer close without month-1 results churns anyway. The Sprint makes the honest economics the product: one fee, a written success bar co-defined on the kickoff call (measured on the client-approved list + copy), a conditional rollover into Growth, and the re-run promise instead of money-back (no arm hits the bar → one more round on us). The client keeps every asset either way; optionally their own Instantly account for +$200.

Never discount it live. The operator price toggle (`?p=low`, Shift+P → $2,450) exists for deliberate exceptions — that is the replacement for the old "trial for a select company we want."

### Managed Outbound Packages — the destination

Where Sprint winners land (**Growth**, $3,350/mo, the entry monthly tier and the emphasized destination) and **Scale** ($5,300/mo) for the heaviest, multi-channel strategic effort (cross-channel touchpoints across LinkedIn, SMS and optional calls, engineered sub-sequences, reverse lead magnets). Month-to-month, no minimum term, sold on strategic effort, not email volume. Above $5,300/mo is custom enterprise. (**Pilot**, the old $1,500/mo entry tier, was retired 2026-07-13; budget-constrained good fits now scope a smaller one-off in the calculator instead.)

### Cost Calculator — self-serve scope-and-quote

The only link safe to share with absolutely anyone. For one-off buyers and prospects who are not a long-term fit. Never send it to a fit prospect first: its sub-$1k floor undercuts the Sprint story.

### Trial Campaigns — RETIRED FROM PUBLIC USE (2026-07-09)

The $580/$1,100 trials measurably damaged deals: buyers anchored on the cheapest visible number and treated everything above it as optional. The page stays live for operator use only. Never link it, never quote it, never volunteer it. The Sprint (plus its secret toggle) covers every job trials used to do.

---

## What this is NOT

- **Do not quote or link trials. Ever.** The Sprint is the entry.
- **Do not open a fit prospect with the calculator.** The $733 floor reads commodity-class and fights the premium story. It is the budget fallback *after* the Sprint pitch, never the opener.
- **Do not discount the Sprint on a call.** Fallback is a smaller one-off in the calculator; deliberate exceptions use the operator toggle.
- **Do not pre-quote the Growth monthly price to a fit prospect.** It is earned after the Sprint proves value, not anchored before.

---

## Mental model in one line

> **The Sprint earns the client. Growth is where they live, Scale is where they grow. The calculator catches the budget-limited and everyone else. Pilot and public trials no longer exist.**

---

## See also

- [`pricing-system-reference.md`](./pricing-system-reference.md) — operational reference: defaults, thresholds, psychological design decisions, file map, sales workflow tables.
- [`pricing-learnings.md`](./pricing-learnings.md) — **central, evolving log** of how our pricing thinking changes over time (the 2026-07-09 entry records this restructure).
- `bleedai-campaign-master/clients/bleedai/growth-plan-2026-07-04/offer-2026-07-08/` — the full evidence base for the Sprint decision (OFFER-BLUEPRINT.md + SPRINT-SPEC.md + evidence/).
- `CLAUDE.md` (repo root) — links to these docs at the top.

---

## Revision log

- **2026-07-13** — PRICE + TIER RESTRUCTURE. Pilot ($1,500/mo) retired; the budget fallback is now a smaller one-off scoped in the calculator. Growth $2,450 to **$3,350/mo** (now the entry monthly tier and the Sprint's rollover destination). Scale $3,450 to **$5,300/mo**, repositioned around cross-channel multi-touch (LinkedIn connection requests, SMS, optional call integrations, CRM-orchestrated) on top of Growth. Growth gains engineered context-based sub-sequences that warm interested leads into booked calls. The $500 Sprint-to-Growth credit was removed. The Sprint page no longer shows or pre-anchors the Growth monthly price (Growth $3,350 now exceeds the $2,950 Sprint, so anchoring the bigger recurring number pre-proof is counterproductive; it is earned on the post-Sprint call). Email volumes nudged up in place (Sprint up to 30k, Growth ~30k-40k, Scale ~50k-75k), kept muted per the effort-not-volume rule. Rationale: prove value with the Sprint, then upgrade proven clients onto a real monthly number that funds scaling the company; multi-channel is the Scale differentiator. Reflected in `/packages` + `/sprint` pages, `pricing.config.ts` (nudge threshold + tier mins), system-reference.md, learnings.md, and campaign-master `pricing-structure.md` + `SPRINT-SPEC.md`.
- **2026-07-09** — THE SPRINT RESTRUCTURE. The Outbound Sprint ($2,950 one-time, up to 8 experiments, 6 weeks, written success bar, conditional rollover into Growth, re-run promise) becomes the default lead offer for every fit prospect. Trials retired from all public surfaces (operator-only). Pilot repositioned as the budget fallback ("spread it monthly"). Routing diagram + scripts rewritten. Evidence + reasoning: bleedai-campaign-master `clients/bleedai/growth-plan-2026-07-04/offer-2026-07-08/`.
- **2026-06-03** — Rewrote as a short routing-focused philosophy. Previous long version split: routing thinking lives here; defaults, decisions, file map, workflow tables moved to `pricing-system-reference.md`.
