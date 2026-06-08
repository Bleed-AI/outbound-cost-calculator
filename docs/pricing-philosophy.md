# BleedAI Pricing — Routing Philosophy

> **Purpose**: when someone asks "how much do you charge?" or "what's the next step?", this doc tells you which of our three links to send them to and what to say. It is the routing brain — short on purpose.
>
> For underlying system mechanics (defaults, thresholds, file map, validation harness, the 15 psychological design decisions), see [`pricing-system-reference.md`](./pricing-system-reference.md).
>
> **Audience**: any human teammate or AI agent answering pricing questions on BleedAI's behalf.
>
> **Last updated**: 2026-06-03. This thinking will evolve — keep the date current when you revise.

---

## TL;DR

We have three links. We do not send all of them to everyone.

| Link | URL | Who it is for | Verbal starting price |
|---|---|---|---|
| Cost Calculator | `calculator.bleedai.com/` | Anyone safely. Intended for one-off buyers and prospects who are not a long-term fit. | starts under $1k for a complete basic campaign |
| Trial Campaigns | `calculator.bleedai.com/trials` | **Select fit prospects only.** A loss-leader we offer to companies we want as long-term clients. Never publicly. | $580 (1-2 trials) / $1,100 (3-5 trials) |
| Managed Outbound Packages | `calculator.bleedai.com/packages` | Fit prospects ready to run monthly. | $1,500/mo (Pilot) → $3,450/mo (Scale) |

**The default for a good-fit prospect is the packages link, plus a mention of trials as a low-cost validation option we run for select companies.** Calculator is the fallback for unfit, budget-constrained, or "let me scope this myself" prospects.

---

## The routing brain

### Step 1 — Read fit in 5 to 10 seconds

Open their company LinkedIn page. Look for:

- **Company page exists with 4-5+ employees visible**, ideally more. This is the primary signal.
- **B2B business model** (not B2C).
- **Product / service category is not over-saturated** — outbound can still cut through.
- Website professionalism is a *weak* signal these days because AI lets anyone look polished. Do not over-weight it.

More employees and stronger signals push the company up the fit ladder. Solo founders or 1-2 person shops are usually not fit (budget is shaky, retainers do not make sense for them).

### Step 2 — Read intent and budget signals

In their actual message and context, listen for:

- **Budget-constrained**: "I don't have much budget", "what's the cheapest option", "just trying something small".
- **Curious / qualifying themselves**: "Interested but want to test", "validate before committing", "do you have a smaller option".
- **Committed**: "We're looking to scale outbound", "ongoing program", clear intent to run cold email seriously.

### Step 3 — Route

```
                           IS THE COMPANY FIT?
              (LinkedIn + 4-5+ employees + B2B + non-saturated)
                                   |
              +--------------------+--------------------+
              |                                         |
             YES                                        NO
              |                                         |
      BUDGET / INTENT?                              CALCULATOR
              |                                  ("scope your own campaign:
   +----------+----------+                        pick leads + experiments,
   |                     |                        get back to us")
 OK / committed     constrained /                 (Optionally mention packages
   |                no commitment                  as our general monthly
PACKAGES link        |                             option, or skip entirely)
+ mention TRIALS   CALCULATOR
  as low-cost      + optionally mention
  validation         packages as the
  for SELECT         monthly option
  companies          if it fits
```

### What to actually say

**Fit + interested or committed → packages, mention trials:**

> "We have three managed monthly packages — Pilot at $1.5k, Growth at $2.45k, Scale at $3.45k — full details here: calculator.bleedai.com/packages. If you want to validate first, we also run **trial campaigns** for select companies — a low-cost way to test if the experiments work for you. Happy to discuss fit on a quick call."

**Fit + budget-constrained, or "let me scope something small" → calculator (optional packages mention):**

> "You can scope a single one-off campaign here: calculator.bleedai.com/. Pick your lead volume and number of campaign experiments — the price computes live. Send over what you want to run.
>
> *(Optional second line if it fits)* If you ever want to make this an ongoing program, our packages start at $1.5k/mo: calculator.bleedai.com/packages."

**Unfit (small / B2C / saturated / weak LinkedIn) → calculator only:**

> "You can scope a single campaign here: calculator.bleedai.com/. Pick your lead volume and number of experiments — the price updates live. Send over what you'd like to run and we'll take it from there."

**Cold inbound asking "how much?" with no context yet:**

First check their LinkedIn. If you cannot, the safe verbal reply mentions trials with the caveat — never lead with the bare trial link:

> "Depends on scope. We have **monthly managed packages** starting at $1.5k (calculator.bleedai.com/packages) and we also run **trial campaigns for select companies** that want to validate first — we determine fit on a quick call. For one-off scoping, our **cost calculator** lets you pick volume + experiments and see the price live (calculator.bleedai.com/). Which direction sounds closest?"

If they then mention budget constraints → calculator. If they sound fit and interested → packages + trials mention.

---

## Why each product exists

### Calculator — self-serve scope-and-quote

For prospects who:

- Just want to buy a one-off campaign.
- Are not a long-term fit (small, B2C, saturated category) but can still get value from a single targeted send.
- Want to scope their own thing and tell us what they want.

A basic complete campaign starts under $1k (1.5k leads, 1 email per prospect, 1 campaign experiment). Most realistic configs land in the low to mid four-figures. **In a verbal quote, lead with the starting price — do not anchor on the upper end. Let the tool reveal the ceiling when someone configures into it.**

The calculator is the only link safe to share with absolutely anyone. No qualification required.

### Trial Campaigns — the gatekept loss-leader

**Trials are not for unqualified prospects.** They are a deliberate loss-leader we offer **only to companies we have decided we want as long-term clients** — fit prospects validating before committing to a package.

- **$580** — 1-2 trials, capped at 2 weeks. For prospects with a clear ICP hypothesis. Fast validation.
- **$1,100** — 3-5 trials, capped at 4 weeks. For prospects with multiple market hypotheses or less certain fit. Higher chance of finding a winner.

We are not really making money on trials. The value is the conversion path: successful trial → package conversation. No-signal trial → honest debrief, possibly calculator as a contained alternative.

**Operational rule**: do not send the trial link in cold outreach or to unqualified inbound. Always mention them as something we *do* for select companies, post-qualification call.

### Managed Outbound Packages — the real product

Where we want fit clients to land. Recurring monthly engagement, full ops, ongoing experiments.

- **Pilot** — $1,500/mo. Entry tier. One winning campaign on autopilot, no monthly experimentation, email support.
- **Growth** — $2,450/mo (emphasized). Multiple monthly experiments, new market testing, Slack support 5 days/week.
- **Scale** — $3,450/mo. Higher volume, advanced reverse leadmagnets, signal-based campaigns.

Above $3,450/mo we drop into custom enterprise sales — not a packaged tier.

---

## What this is NOT

- **Do not blast the trial link.** Trials are gatekept. Sending publicly turns the loss-leader into a loss.
- **Do not anchor on the calculator ceiling in a verbal quote.** Lead with the starting price. The tool reveals the upper end when someone configures into it.
- **Do not pitch trials to clearly unfit prospects** (solo founder, B2C, no LinkedIn presence). Send calculator. Be honest about scope.

---

## Mental model in one line

> **Packages is what we want clients on. Trials are how we get fit prospects to packages. Calculator catches everyone else.**

---

## See also

- [`pricing-system-reference.md`](./pricing-system-reference.md) — operational reference: every default, every threshold, all 15 psychological design decisions baked into the calculator, the file map, the validation harness, sales workflow tables.
- [`pricing-learnings.md`](./pricing-learnings.md) — **central, evolving log** of how our pricing thinking changes over time (read this to stay current; append here when the thinking evolves). Read by pricing agents + the proposal generator.
- `CLAUDE.md` (repo root) — links to both docs at the top.

---

## Revision log

- **2026-06-03** — Rewrote as a short routing-focused philosophy. Previous long version (which mixed philosophy with system mechanics) split: routing thinking lives here; defaults, decisions, file map, workflow tables moved to `pricing-system-reference.md`. Routing brain now centered on: fit signals (LinkedIn + 4-5+ employees + B2B + non-saturated category), default to packages for fit prospects, trials are gatekept and post-call only, calculator is the safe-for-anyone fallback.
