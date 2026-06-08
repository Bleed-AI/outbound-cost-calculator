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
> **Last updated**: 2026-06-08.

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

<!-- Append new dated entries above this line, most recent first. -->
