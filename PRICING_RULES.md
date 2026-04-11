# Pricing Rules — Ground Truth

This document is the **single source of truth** for how pricing works in this
calculator. Whenever you change prices or the calculation logic, update:

1. `src/lib/pricing.config.ts` — the numbers
2. `src/lib/pricing.ts` — the formulas
3. **This file** — the human-readable rules
4. `src/lib/pricing.test.ts` — the tests that lock the rules in place

If you change one without the others, you'll drift — and the UI will start
showing numbers that don't match what clients actually get invoiced for.
**Run `npm test` after every pricing change.**

---

## 1. The four pricing scenarios

The calculator has two orthogonal toggles that combine into four scenarios:

| Month type | Infrastructure | Scenario |
|---|---|---|
| `normal_month` | `dfy` (BleedAI warm) | **1. Normal + DFY** — full recurring billing, full capacity |
| `normal_month` | `user_domains` (Branded) | **2. Normal + Branded** — full recurring billing, full capacity |
| `first_month` | `dfy` | **3. Pilot + DFY** — full recurring billing (no warmup needed) |
| `first_month` | `user_domains` | **4. Pilot + Branded** — ramp-phase billing + one-time setup fee |

Only **Scenario 4** triggers special ramp-phase logic. The Pilot Month panel
in the UI (`MonthTypeSection.tsx`) only shows when Scenario 4 is selected.

---

## 2. Line item types and periods

Every line item in `calculateTotal()` carries two fields:

- **`type`**: `'fixed'` | `'variable'` | `'addon'` — semantic grouping for display
- **`period`**: `'monthly'` | `'one-time'` — **this is what matters for waiver thresholds**

| Category | Items | Period |
|---|---|---|
| **Fixed** | Copywriting, Campaign Strategy, Support | `monthly` |
| **Fixed** | Branded Setup Fee, n8n Build Fee, Instantly Setup | `one-time` |
| **Variable** | Inbox & Infra (DFY or Branded), Lead Data, Enrichments, Reply Handling | `monthly` |
| **Add-ons** | LinkedIn, CRM, Drip Monthly, Infra Management | `monthly` |
| **Add-ons** | Drip One-time, Landing Page | `one-time` |

**Critical rule:** Waiver thresholds (support, infra management) are checked
against **`period === 'monthly'` items only**. One-time fees are added to the
grand total but do **not** count toward unlocking free support or free infra.

This is enforced in `pricing.ts` via the `sumMonthly()` helper. The tests
`BUGFIX: one-time fees...` and `BUGFIX: one-time add-ons...` in
`pricing.test.ts` lock this in place.

---

## 3. Calculation flow

```
For each calculateTotal(state):

  1. Compute billingEmails
     └─ Scenario 4: month1ActualEmails (= inboxes × 210 ramp formula)
     └─ All others: totalEmails (= leadsPerMonth × emailsPerProspect)

  2. Compute discountPercent from volumeDiscounts table (leads-based)

  3. Push line items in order:
     ├─ Branded Setup fee (Scenario 4 only, one-time)
     ├─ Instantly Setup (optional, one-time)
     ├─ Copywriting (monthly)
     ├─ Campaign Strategies (monthly, reduced by included tier)
     ├─ n8n Build Fee (if custom_n8n, one-time)
     ├─ Inbox & Infrastructure (variable, monthly, × billingEmails)
     ├─ Lead Data (variable, monthly, × leads)
     ├─ Enrichments (variable, monthly, × leads)
     ├─ Reply Handling (variable, monthly, × billingEmails, if not 'none')
     ├─ LinkedIn / CRM (if selected, monthly)
     ├─ Drip Sequence (one-time + monthly, if selected)
     └─ Landing Page (if selected, one-time)

  4. Compute recurringPreInfra = sum of monthly line items so far
     └─ If ≥ $2,000: infra management is WAIVED (amount = $0)
     └─ Else: charged at $25/1k × billingEmails

  5. Push Infra Management line (monthly, possibly $0 if waived)

  6. Compute recurringPreSupport = sum of monthly line items so far
     └─ This is the `baseTotal` returned to the UI
     └─ If ≥ threshold for selected support tier: support is FREE
     └─ Else: charged at the per-campaign rate

  7. Push Support line (monthly, possibly $0 if waived)

  8. Compute grand totals:
     ├─ monthlyRecurringTotal = sum of all monthly line items (includes support)
     ├─ oneTimeTotal = sum of all one-time line items
     └─ preDiscountTotal = monthlyRecurringTotal + oneTimeTotal

  9. Apply coupon discount (% off preDiscountTotal)

  10. Apply Upwork fee (10% on top of post-coupon total)

  11. Return PricingResult
```

---

## 4. Key invariants (tested in `pricing.test.ts`)

1. **Volume discount applies to variable costs only**, not fixed fees or
   add-ons. Config table: `PRICING.volumeDiscounts`.

2. **Campaign strategies are included free at higher lead volumes:**
   - ≥ 7,500 leads → 2 strategies included
   - ≥ 10,000 leads → 3 strategies included

3. **Support waiver thresholds** (config: `supportWaiverThresholds`):
   - Email: free if recurring ≥ $500/mo
   - Slack Light: free if recurring ≥ $1,000/mo
   - Slack Full: free if recurring ≥ $2,000/mo

4. **Infra management waiver:** free if recurring ≥ $2,000/mo.

5. **Waiver thresholds are checked against RECURRING (monthly) items only.**
   One-time fees (branded setup, instantly setup, n8n build, drip one-time,
   landing page) are invoiced but don't count toward these thresholds.

6. **Scenario 4 (Pilot + Branded) bills variable costs on ramp emails**
   (`month1ActualEmails = inboxesNeeded × 210`), not on full capacity.
   - Ramp formula: inboxes × (rampDays/2) × (2 × startPerDay + (rampDays-1) × dailyIncrement)
   - With default config: rampDays=14, startPerDay=2, dailyIncrement=2 → 210 emails/inbox over 14 days.

7. **The "Month 2 Onwards" card in the Pilot panel is computed by calling
   `calculateTotal()` with `monthType: 'normal_month'`** and the same other
   state. This guarantees it equals what the client will see if they toggle
   to Normal Month. See `Calculator.tsx:58-62`.

8. **Coupon discount is applied before Upwork fee.** Order matters:
   `preDiscountTotal → coupon → upwork → total`.

---

## 5. Provider costs (NOT on BleedAI's invoice)

In Scenario 4, the UI shows "provider cost estimates" inside the Pilot Month
panel. These are **paid by the client directly to their inbox provider** (e.g.
Instantly, MailReef, Maildoso) — BleedAI does not invoice them.

Calculation (in `MonthTypeSection.tsx`, function `InfraEstimator`):

- **Inboxes needed** = ceil(capacity / 500)
- **Domains needed** = ceil(capacity / 1500)
- **Domain cost (one-time)** = domains × $12
- **Inbox cost (monthly)** = inboxes × tier_rate
- **Inbox tier rates:**
  - 1–29 inboxes: $3.50/mo each
  - 30–99 inboxes: $3.25/mo each
  - 100+ inboxes: $3.00/mo each

**Pilot card "+ to provider" row**: domains one-time + inboxes month 1 = lump
sum to set up + run the first month.

**Month 2+ card "+ to provider" row**: inboxes monthly only (no new domains).

If you change the provider cost calculation, keep the two rows in
`MonthTypeSection.tsx` (pilot card + month 2 card) and the `InfraEstimator`
component in sync.

---

## 6. Coupons

Defined in `src/lib/pricing.ts → COUPON_CODES`:

```ts
NEW5: 5      // 5% off
SPECIAL10: 10
VIP15: 15
ULTRA20: 20
```

Applied to `preDiscountTotal` (after volume discount, before Upwork fee).
Stored in URL state (`cp` param). To add a new code: add the key/value pair.

---

## 7. How to add a new pricing rule safely

1. **Edit `pricing.config.ts`** — add the number
2. **Edit `pricing.ts`** — add the line item push logic
3. **Edit this file (`PRICING_RULES.md`)** — document the rule in plain English
4. **Edit `pricing.test.ts`** — add at least one test that asserts the rule
5. **Run `npm test`** — confirm everything still passes
6. **Run `npm run build`** — confirm TypeScript is happy
7. Test the UI manually with `npm run dev`

If you skip any step you'll eventually ship a regression.

---

## 8. Known quirks

- **Copywriting is labeled `'monthly'` in pricing.ts but the config comment says "one-time".** The code is the source of truth — it behaves as monthly (charged every month). The comment in `pricing.config.ts` is misleading and should be cleaned up if you're editing that file.

- **Campaign strategy amounts are labeled `'monthly'` in pricing.ts but conceptually the cost is paid once per new strategy built.** Same deal — the code treats it as monthly; if this changes we need to update the line item period.

- **In Scenario 4, support and infra waiver thresholds are checked against the ramp-billed recurring total, not the month-2+ recurring total.** This means a Pilot+Branded client might not qualify for free support during pilot month but will qualify starting month 2. This is a known edge case — if it becomes a client complaint, we should compute thresholds against the full-capacity recurring figure instead.
