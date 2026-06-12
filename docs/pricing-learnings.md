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
> **Last updated**: 2026-06-12.

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

<!-- Append new dated entries above this line, most recent first. -->
