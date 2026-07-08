# BleedAI Pricing — Routing Philosophy

> **Purpose**: when someone asks "how much do you charge?" or "what's the next step?", this doc tells you which of our links to send them to and what to say. It is the routing brain — short on purpose.
>
> For underlying system mechanics (defaults, thresholds, file map, validation harness, the psychological design decisions), see [`pricing-system-reference.md`](./pricing-system-reference.md).
>
> **Audience**: any human teammate or AI agent answering pricing questions on BleedAI's behalf.
>
> **Last updated**: 2026-07-09. This thinking will evolve — keep the date current when you revise.

---

## TL;DR

We have four surfaces. We do not send all of them to everyone.

| Link | URL | Who it is for | Verbal starting price |
|---|---|---|---|
| **The Outbound Sprint** | `calculator.bleedai.com/sprint` | **The default for every fit prospect.** One-time, 6-week proof engagement: up to 8 campaign experiments, written success bar, rolls into Growth. | $2,950 one-time |
| Managed Outbound Packages | `calculator.bleedai.com/packages` | The destination (Growth) and the budget fallback (Pilot, "spread it monthly"). Also for committed buyers who want ongoing from day one. | $1,500/mo (Pilot) → $3,450/mo (Scale) |
| Cost Calculator | `calculator.bleedai.com/` | Anyone safely. One-off scoping for prospects who are not a long-term fit. | starts under $1k for a basic campaign |
| Trial Campaigns | `calculator.bleedai.com/trials` | **OPERATOR-ONLY as of 2026-07-09.** Removed from all public nav and site references. Never linked, never quoted; the Sprint's secret price toggle replaced its "select company we want to win" job. | (never volunteered) |

**The default for a good-fit prospect is the Sprint link.** Growth ($2,450/mo) is anchored in the same breath as what the Sprint rolls into. Pilot ($1,500/mo) is the fallback when the one-time fee is the objection. Calculator is the catch-all for unfit or "let me scope it myself" prospects.

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
   |       directly      PILOT $1,500/mo
 SPRINT    (or Scale)    ("same winning play,
 $2,950                   cost spread monthly")
 + anchor
 Growth $2,450
 on the same call
```

### What to actually say

**Fit prospect (default) → Sprint, Growth anchored:**

> "The way we start with almost everyone is The Outbound Sprint: six weeks, one fixed price ($2,950), we map every outbound method and signal relevant to your market and run up to 8 campaign experiments against each other until one wins. We write the success bar together before anything sends, and if it hits, you roll into Growth at $2,450/mo, month to month. Everything we build is yours either way: calculator.bleedai.com/sprint"

**Fit + the one-time fee is the objection → Pilot as installments:**

> "If the upfront number is the issue, our Pilot plan runs the winning play at $1,500/mo, month to month, and we can move you to a Sprint-style multi-experiment push later. Details: calculator.bleedai.com/packages"

**Fit + clearly committed to ongoing → Growth directly:**

> "Sounds like you already know you want outbound running every month. Growth is $2,450/mo, month to month, multiple experiments tested monthly: calculator.bleedai.com/packages. Happy to walk you through it on a quick call."

**Unfit (small / B2C / saturated / weak LinkedIn) → calculator only:**

> "You can scope a single campaign here: calculator.bleedai.com/. Pick your lead volume and number of experiments — the price updates live. Send over what you'd like to run and we'll take it from there."

**Cold inbound asking "how much?" with no context yet:**

> "Depends on scope. Most companies start with The Outbound Sprint: a 6-week, fixed-price engagement (starts at $2,950) where we run up to 8 cold email experiments and you keep everything we build: calculator.bleedai.com/sprint. If you already know you want it running monthly, packages start at $1.5k/mo: calculator.bleedai.com/packages. Which direction sounds closest?"

---

## Why each product exists

### The Outbound Sprint — the lead offer (first contract)

The paid, bounded proof engagement, and the answer to the two facts that kill deals: buyers cannot commit to "another monthly payment" for an unproven channel, and a retainer close without month-1 results churns anyway. The Sprint makes the honest economics the product: one fee, a written success bar co-defined on the kickoff call (measured on the client-approved list + copy), a conditional rollover into Growth (with $500 of the fee credited to month 1), and the re-run promise instead of money-back (no arm hits the bar → one more round on us). The client keeps every asset either way; optionally their own Instantly account for +$200.

Never discount it live. The operator price toggle (`?p=low`, Shift+P → $2,450) exists for deliberate exceptions — that is the replacement for the old "trial for a select company we want."

### Managed Outbound Packages — the destination and the fallback

Where Sprint winners land (**Growth**, $2,450/mo, emphasized) and where budget-constrained good fits start (**Pilot**, $1,500/mo, positioned as "the cost, spread monthly", never as the default pitch). **Scale** ($3,450/mo) for the heaviest strategic effort. Month-to-month, no minimum term, sold on strategic effort, not email volume. Above $3,450/mo is custom enterprise.

### Cost Calculator — self-serve scope-and-quote

The only link safe to share with absolutely anyone. For one-off buyers and prospects who are not a long-term fit. Never send it to a fit prospect first: its sub-$1k floor undercuts the Sprint story.

### Trial Campaigns — RETIRED FROM PUBLIC USE (2026-07-09)

The $580/$1,100 trials measurably damaged deals: buyers anchored on the cheapest visible number and treated everything above it as optional. The page stays live for operator use only. Never link it, never quote it, never volunteer it. The Sprint (plus its secret toggle) covers every job trials used to do.

---

## What this is NOT

- **Do not quote or link trials. Ever.** The Sprint is the entry.
- **Do not lead a fit prospect with the calculator.** The $733 floor reads commodity-class and fights the premium story.
- **Do not discount the Sprint on a call.** Fallback is Pilot monthly; deliberate exceptions use the operator toggle.
- **Do not pitch Pilot proactively.** It is the budget fallback, not the opener.

---

## Mental model in one line

> **The Sprint earns the client. Growth is where they live. Pilot spreads the cost for the ones who need it. Calculator catches everyone else. Trials no longer exist publicly.**

---

## See also

- [`pricing-system-reference.md`](./pricing-system-reference.md) — operational reference: defaults, thresholds, psychological design decisions, file map, sales workflow tables.
- [`pricing-learnings.md`](./pricing-learnings.md) — **central, evolving log** of how our pricing thinking changes over time (the 2026-07-09 entry records this restructure).
- `bleedai-campaign-master/clients/bleedai/growth-plan-2026-07-04/offer-2026-07-08/` — the full evidence base for the Sprint decision (OFFER-BLUEPRINT.md + SPRINT-SPEC.md + evidence/).
- `CLAUDE.md` (repo root) — links to these docs at the top.

---

## Revision log

- **2026-07-09** — THE SPRINT RESTRUCTURE. The Outbound Sprint ($2,950 one-time, up to 8 experiments, 6 weeks, written success bar, conditional rollover into Growth, re-run promise) becomes the default lead offer for every fit prospect. Trials retired from all public surfaces (operator-only). Pilot repositioned as the budget fallback ("spread it monthly"). Routing diagram + scripts rewritten. Evidence + reasoning: bleedai-campaign-master `clients/bleedai/growth-plan-2026-07-04/offer-2026-07-08/`.
- **2026-06-03** — Rewrote as a short routing-focused philosophy. Previous long version split: routing thinking lives here; defaults, decisions, file map, workflow tables moved to `pricing-system-reference.md`.
