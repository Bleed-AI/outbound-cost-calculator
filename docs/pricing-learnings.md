# BleedAI Pricing — Evolving Learnings

> **Purpose**: the **central, append-only log of how our pricing thinking evolves**. The philosophy and
> system docs describe the *current* state; this file records *changes and the reasoning behind them* as the
> company grows and we learn from real deals. It is the single place any AI agent or teammate should read to
> stay current on pricing intuition — pricing-Q&A agents, the proposal generator, sales.
>
> **Audience**: any human or AI agent reasoning about BleedAI pricing.
>
> **How to use it**: when our pricing or deal-construction thinking genuinely changes (not a one-off
> negotiation, but a *pattern* worth keeping), append a dated entry below. If the change alters the
> *current* state, also update [`pricing-philosophy.md`](./pricing-philosophy.md) (routing) or
> [`pricing-system-reference.md`](./pricing-system-reference.md) (mechanics) so they stay accurate — this
> log is the *why/when*, those are the *what/now*.
>
> **Companion**: deal-*construction* craft for proposals (bundling, scarcity framing, voice) lives in the
> proposal skill's `proposal-playbook.md` (in `Upwork Sales Agent/.claude/skills/create-proposal/`). When a
> learning is really about list price or routing, it belongs **here**; when it's about how to *frame/sell* a
> deal, it belongs there. Cross-reference both ways.
>
> **Last updated**: 2026-07-13.

---

## Entry format

```
### YYYY-MM-DD — <short title>
**What changed:** ...
**Why (the intuition):** ...
**Where reflected:** philosophy.md / system-reference.md / proposal-playbook.md / (this log only)
**Triggered by:** <deal, observation, or session>
```

---

## Learnings

### 2026-07-13 — Price + tier restructure: Pilot retired, Growth/Scale raised, Scale goes multi-channel
**What changed:** Cut the packages ladder from three tiers to two and raised both. **Pilot ($1,500/mo) retired** entirely; the budget fallback for a fit prospect who balks at the one-time fee is now a smaller one-off scoped in the calculator, not a monthly plan. **Growth $2,450 to $3,350/mo** (now the entry monthly tier and the Sprint's rollover destination); it absorbed Pilot's foundational deliverables (all domains + inbox fees covered, DFY sourcing, AI reply agent) and gained **engineered, context-based sub-sequences that warm interested leads into booked calls**. **Scale $3,450 to $5,300/mo**, repositioned around **cross-channel multi-touch** on top of Growth: LinkedIn connection requests, SMS touchpoints, optional call integrations orchestrated at the CRM level, and LinkedIn touchpoints on interested leads. Removed the **$500 Sprint-to-Growth credit** everywhere. The `/sprint` page no longer shows or pre-anchors the Growth monthly price. Email volumes nudged up in place, kept muted (Sprint up to 30k, Growth ~30k-40k, Scale ~50k-75k). Calculator package-nudge floor moved $1,500 to $3,350; the `/packages` grid is now a centered 2-column layout.
**Why (the intuition):** The Sprint proves value first, so the monthly number it rolls into can (and should) be a real one that actually funds scaling the company, not a soft $2,450 anchored pre-proof. Once Growth exceeds the $2,950 Sprint, pre-quoting the bigger recurring number on the sprint page works against the sale, so the rule flipped: de-anchor Growth, earn it on the post-Sprint call. Pilot was a discount tier competing with our own Sprint and the calculator; a fit buyer who truly can't do the Sprint fee is better served by a contained one-off they scope themselves (honest, self-serve, no cheap monthly anchor dragging the ladder down), and Growth absorbing Pilot's base means the entry monthly tier is now a complete machine, not a stripped one. The company's growth lever is upgrading proven clients: Sprint proves it, Growth runs it, and Scale is where we differentiate on **channel** (email is table stakes; LinkedIn + SMS + calls + CRM-orchestrated nurture is what a serious buyer pays $5,300 for). Volume stays muted per the 2026-06-12 effort-not-volume learning; the bumps just keep the side-detail numbers credible against the higher prices.
**Where reflected:** philosophy.md (routing rewrite: budget branch Pilot to calculator, de-anchor Growth, mental model, scripts) + system-reference.md (§1/§5/§7/§8.3/§8.16/§11) + this repo's `/packages` + `/sprint` pages, `pricing.config.ts` (nudge threshold + `packageTiers` mins), `PackagesView.tsx`, `SprintView.tsx`, `TopBannerNudge.tsx` + campaign-master `pricing-structure.md` (reply-agent facts resync) and `SPRINT-SPEC.md` (revised note). Proposal generator + reply agents must quote $3,350 Growth / $5,300 Scale and never mention Pilot, the $500 credit, or a pre-Sprint Growth price.
**Triggered by:** Taha, 2026-07-13 session, scaling-the-company pricing pass ("prove value with the Sprint, then get people onto a real monthly package"; Scale gets the engineered multi-channel warm-to-booked system, Growth gets context-based sub-sequences). Tuning dial: watch Sprint to Growth conversion at the new $3,350 and whether the removed sub-$3,350 nudge costs any calculator-to-monthly upsell.

### 2026-07-09 — The Outbound Sprint becomes the lead offer; trials retired from public use
**What changed:** Adopted a new flagship entry SKU: **The Outbound Sprint**, $2,950 one-time, 6 weeks, up to 8
campaign experiments run as a tournament (map every relevant sourcing method + buying signal, kill losers,
scale the winner), written success bar co-defined on the kickoff call and measured on client-approved inputs,
conditional rollover into Growth ($2,450/mo) with a $500 fee credit, the "re-run promise" instead of money-back
(no experiment hits the bar → one more round on us), client keeps every asset either way, optional own
Instantly account +$200. New page at `/sprint` with an operator-only price toggle (low = $2,450). Trials
($580/$1,100) removed from all public nav and references on calculator.bleedai.com AND bleedai.com (page stays
live, operator-only). Pilot ($1,500/mo) repositioned as the budget fallback ("spread the cost monthly"), never
the opener.
**Why (the intuition):** Three evidence streams converged (20-competitor scan, expert-corpus mining, sales-call
re-read; all in bleedai-campaign-master `clients/bleedai/growth-plan-2026-07-04/offer-2026-07-08/`). (1) At our
stage retainer revenue is illusory anyway: no month-1 results = month-2 churn, so the bounded one-off is the
same economics with the honesty turned into a feature, and it is mentally easier to buy (Hormozi: bounded
one-time closes ~3x better at a higher price, then upsell recurring). (2) Taha improvised exactly this offer
twice on live calls (~$2,600 one-time) and price was never the objection; fog was. (3) The $580 trial anchor
demonstrably killed deals (buyers anchored on the cheapest visible number). (4) The competitive slot is empty:
nobody credible leads with a paid $2-5k bounded first campaign, and nobody anywhere does a conditional
rollover ("the retainer only starts if the bar is hit"), which doubles as the believable guarantee for burned,
skeptical buyers without refund fights. (5) Cash-poor buyers (the Jazib case) do not need a cheaper Sprint,
they need installments, which is what Pilot already is.
**Where reflected:** philosophy.md (full routing rewrite, same date); `/sprint` page + nav + InquiryModal in
this repo; bleedai.com trial references replaced; `pricing-structure.md` (campaign-master) resynced;
walkthrough-proposal template (`sales-calls/synthesis/proposal-template.html`) rebuilt on the Sprint.
**Triggered by:** the 2026-07-08/09 offer-decision session (growth-plan Bet B / open decision #1), Taha's
adoption call 2026-07-09. Tuning dial going forward: 18-30% live-call close rate on ~10 Sprint pitches; under
18% = overpriced for current authority, over 30% = raise. KPI that decides the strategy: Sprint → Growth
conversion.

### 2026-06-08 — Log created; proposal generator now reads pricing centrally
**What changed:** Stood up this central learnings log. The new `create-proposal` skill (in the Upwork Sales
Agent repo) reads the central pricing docs at deal time and routes any pricing-philosophy-level learning
back here, rather than keeping a private drifting copy.
**Why (the intuition):** Pricing philosophy was scattered — every agent that touches pricing needs one
canonical, continuously-updated source so the whole system prices and routes consistently as we evolve.
A central place that updates over time beats per-tool snapshots that silently diverge.
**Where reflected:** this log + linked from philosophy.md and system-reference.md.
**Triggered by:** building the proposal-creation skill (2026-06-08).

### 2026-06-12 — Packages sold on strategic effort, not email volume
**What changed:** Repositioned the `/packages` tiers. The page previously bolded email volume as the headline
differentiator (10k → 20k–30k → 50k–60k). Now each tier leads with a bold strategy **headline** + a 3-bar
**effort meter**; volume is demoted to a muted side-detail line plus a page footnote ("volume is never a reason
on its own to size up"). Added a "Built on our sourcing stack" chip strip (Claygent · Prospeo · Sales Nav ·
Apollo · Google Maps · Niche Directories) for premium credibility. Reframed the hero subtitle and intro to the
effort-not-volume thesis; rephrased one-off/trial cross-links to drop diminishing language.
**Why (the intuition):** The #1 objection from package prospects was *"I don't need to send that many emails"* —
and they were right. The thing that actually scales across tiers is **effort and strategic complexity** (single
proven play → multi-segment monthly experimentation → advanced multi-signal campaigns + reverse lead magnets),
not send count. Pricing on volume mis-anchors the value and loses prospects who run low-volume-but-high-effort
plays — including ones who'd happily pay Pilot if it weren't framed as a 10k-email firehose. Signals are
included at every tier; the higher tiers leverage *more, harder* strategy rather than unlocking gated features.
**Where reflected:** PackagesView.tsx + Header.tsx (code); system-reference.md §5 + new §8.16; philosophy.md
(Managed Outbound Packages section). Proposal generator should now frame package upsells on effort/strategy
depth, not email throughput.
**Triggered by:** Taha — recurring real-deal objection that the only visible difference between tiers was email
volume (2026-06-12 session). Premium-look + sourcing-icons request handled in the same pass.

### 2026-06-12 — Calculator no-ramp model, infra folded into total, real tool stack, trial anchoring
**What changed:** Big pass across all three pages.
- **Calculator capacity/timeline:** retired the ramp model. Now a fixed 6 weeks — 2wk warmup + 4wk full-capacity
  sending at **27 emails/inbox/day** (weekdays). Inboxes = `ceil(totalEmails/540)`, 3 inboxes/domain, +1 backup
  domain per 5k emails. Duration is fixed; inbox count scales with volume.
- **Infrastructure now folded into the total:** branded domains (1 yr) + inboxes (2 mo) are added to the campaign
  total **at cost, not discounted**, framed as "included, yours to keep" with an on-demand breakdown. Previously
  shown as a separate "pay your provider ≈$X" estimate. The `$35/1k` line was relabelled *Managed Sending &
  Deliverability* (the service) so it doesn't read as double-charging the assets. Default config total moved
  ~$1,263 → ~$1,461.
- **One-off framing:** dropped "/month" — prominent number is now *Total Emails This Campaign*; monthly capacity
  demoted to a side-note. Slack-only support (email retired). "What You Get" now icon-per-item. Coupon box back
  (behind a toggle below the total).
- **Packages/Trials:** real categorized tool stack (Sourcing/Email-finding/Enrichment/Orchestration/Sending) with
  official marks where available; "Clay" (not Claygent). Trials now anchor with a struck-through "real" value
  ($1,800 / $3,600) above the subsidized fee.
**Why (the intuition):** (1) Prospects were confused by "leads/month" on a one-off tool and by multiple separate
infra costs — the fix is one number, "everything included," with detail on demand. (2) The infra is real value the
client keeps; folding it in (vs "you'll also owe your provider $X") makes the price feel complete and generous
rather than nickel-and-dimed. (3) The real timeline genuinely changed operationally (full capacity after warmup,
no ramp), so the calculator had to match reality. (4) Showing the actual tool stack with real logos makes BleedAI
read as a legit operation, not a freelancer. (5) Trials are loss-leaders — anchoring the "real" price makes the
subsidy legible and raises perceived value.
**Where reflected:** pricing.config.ts/pricing.ts/types.ts + CostBreakdown/CampaignVolumeSection/CampaignSetupSummary/
SupportSection/PackagesView/TrialsView/Header + ToolStack.tsx + brand-icons.ts + send-order email; system-reference.md
§2/§3/§8.1/§8.2/§8.17/§8.18; this log. Proposal generator: quote campaigns as 6-week, infra-included; sell trials
with the anchor framing.
**Triggered by:** Taha — break-time batch of corrections (2026-06-12): "calculator is one-off, why leads/month";
new ramp/capacity numbers; "include domain + 2mo inboxes, feel like a good deal"; real tool logos; trial strikethrough.

<!-- Append new dated entries above this line, most recent first. -->
