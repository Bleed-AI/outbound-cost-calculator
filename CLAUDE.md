# Outbound Cost Calculator — Developer Guide

> **🔑 Pricing thinking is split across two docs:**
> - [`docs/pricing-philosophy.md`](docs/pricing-philosophy.md) — short routing brain. Who gets which link (Calculator / Trials / Packages) and why. Read this before quoting prices verbally or deciding which link to share with a prospect.
> - [`docs/pricing-system-reference.md`](docs/pricing-system-reference.md) — operational reference. Every default, every threshold, all 15 psychological design decisions baked into the calculator, file map, validation harness. Read this before touching `pricing.config.ts` or changing any default.

<!-- BLEEDAI-SHARED-STACK:START — auto-managed by templates/lite-kit. Edit the template, not this block. -->
## 🔑 Shared tool stack (every BleedAI project knows this)

**Credentials = Doppler. No raw `.env` files.** Run scripts via `bin/dev <cmd>` (or `bin\dev` on Windows) to inject all secrets at runtime. Onboarding is `doppler login` once → done.

- Doppler project: `bleedai` | This config: `prd_outbound-cost-calculator` (cloned from shared `prd` — inherits 22+ common secrets, plus any repo-specific ones)
- Add a new secret here: `doppler secrets set KEY=value --project bleedai --config prd_outbound-cost-calculator`
- Add a secret shared by EVERY project: `doppler secrets set KEY=value --project bleedai --config prd` (then re-clone the branch configs to pull it down)

**Google Drive = service account** (`bleedai-bot@…iam.gserviceaccount.com`). Use the **shared Drive root** — NOT "My Drive" (it has zero quota). Pass `supportsAllDrives=true` on every API call. The service account JSON is in Doppler as `GOOGLE_SERVICE_ACCOUNT_JSON`; `bin/onboard.ps1` writes it to `tmp/google-service-account.json` automatically.

**Web research = layered, pick by job:**

| Tool | Env var | When to use | Cost |
|---|---|---|---|
| `WebSearch` (Claude built-in) | — | Quick lookups, citations | Free |
| `WebFetch` (Claude built-in) | — | Plain-text scrape of one URL | Free |
| Serper | `SERPER_API_KEY` | Google SERP, News, LinkedIn pages, /scrape | ~$0.001/call |
| Parallel.ai | `PARALLEL_API_KEY` | Structured extraction, anti-bot scrape | lite ~$0.003 · pro ~$0.10 · ultra ~$0.30 |
| Apify | `APIFY_TOKEN` | Specialty actors (LinkedIn, Google Maps, etc.) | varies per actor |
| OpenWebNinja | `OPENWEBNINJA_API_KEY` | Local Business Data fallback | free tier |
| Spider / ZenRows | `SPIDER_API_KEY` · `ZENROWS_API_KEY` | Heavy anti-bot fallback | varies |

**Email & enrichment:** `PROSPEO_API_KEY` (DM finder + verification), `TRYKIT_API_KEY` (email verification — `valid-risky` is catch-all-deemed-valid, NOT a raw catch-all), `INSTANTLY_API_KEY` (cold email sending), `APOLLO_*` (when needed).

**LLM:** `OPENAI_API_KEY` (default model: `OPENAI_DEFAULT_MODEL`). For Claygent inside Clay tables, BleedAI's OpenAI key is used directly — not Clay credits.

**Clay:** runs on the Legacy `$350` plan (grandfathered) → ~10K credits / billing period. Local bridge at `localhost:12306` (`Bleed-AI/clay-mcp-bridge`, auto-installed by `bin/onboard.ps1`). Tailscale Funnel `bleedai.tail913862.ts.net` is the HTTP API callback tunnel for Clay.

**First-run check.** `scripts/first-run-check.cjs` runs at every session start. On a fresh clone it auto-installs npm deps, wires the pre-commit hook, validates Doppler auth. Subsequent sessions: silent. To force re-check: delete `.claude/.first-run-complete`.

**Team identity.** `.claude/team-roster.json` is the canonical roster. `bin/whoami.cjs` matches your `git config user.email` against it to tailor what Claude shows you. Onboard new teammates via `/onboard-team` in campaign-master (owner-only).

**Slack:** bot user `ava` (`U0AM08T3GMT`) posts to `#bleedai-all` (`C0B2XJUQF5Y`) on protocol-class changes. `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` in Doppler.

**Security:** `.githooks/pre-commit` blocks commits containing `Bearer <long-token>`, `sk-...`, `apify_api_...`, and three known-leaked keys. Bypass (legit case only): `git commit --no-verify`. The hook is auto-wired by first-run-check.
<!-- BLEEDAI-SHARED-STACK:END -->

---

## What this project is

Three-page Next.js app at **`calculator.bleedai.com`** that routes cold-outreach prospects into the right product:

| Route | Product | Audience |
|---|---|---|
| `/` | Cost Calculator (One-Time Campaigns) | Decided one-off buyers |
| `/trials` | Trial Campaigns ($350–$1,100) | Prospects validating fit |
| `/packages` | Managed Outbound Packages ($1,500–$3,450/mo, Pilot/Growth/Scale) | Committed monthly clients |

**Routing thinking** (who gets which link, what to say) lives in [`docs/pricing-philosophy.md`](docs/pricing-philosophy.md). **System mechanics** (defaults, thresholds, 15 design decisions, sales workflow, what we chose NOT to do, file map) live in [`docs/pricing-system-reference.md`](docs/pricing-system-reference.md). Those docs supersede this one for any pricing or copy decision.

## Deployment

- **GitHub**: `Bleed-AI/outbound-cost-calculator` (public, `main` branch)
- **Vercel**: auto-deploys on every `git push origin main` — live in ~30s
- **URL**: `calculator.bleedai.com` (CNAME → `cname.vercel-dns.com`)
- **Env vars set in Vercel**: `RESEND_API_KEY`, `FROM_EMAIL`

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Resend (email) · Framer Motion (animation) · Vercel

## Dev Commands

```bash
npm run dev                            # localhost:3000
npm run build                          # production build + TypeScript check (run before every push)
npx tsx scripts/validate-pricing.ts    # pricing math sanity check across floor/typical/ceiling configs
```

## Git / Deploy Workflow

**Always run `npm run build` after making changes to catch TypeScript errors.**

**Do NOT push to GitHub until the user explicitly says so.** The user reviews changes locally first before deploying. Only commit and push when asked (e.g. "push it", "commit and push", "update github").

---

## File map

### Pricing engine + state
| File | Role |
|---|---|
| `src/lib/pricing.config.ts` | **All prices, thresholds, package tier mins, nudge threshold, volume discounts, support tiers, add-ons, warmup math** — edit this to change any dollar amount |
| `src/lib/pricing.ts` | `calculateTotal()`, `computeCampaignPhases()`, `getContractDates()`, `DEFAULT_STATE`, `COUPON_CODES`, `LEADS_OPTIONS`, `CAMPAIGNS_OPTIONS` |
| `src/lib/types.ts` | `SelectionState`, `PricingResult`, `LineItem`, all tier-key unions |
| `src/lib/url-state.ts` | URL ↔ state serialization (short param keys) + backward-compat for legacy params |

### Page shells
| File | Role |
|---|---|
| `src/app/page.tsx` | `/` — renders `<HomeShell />` (banner above header + Calculator + ResultsGallery) |
| `src/app/trials/page.tsx` | `/trials` — Header + `<TrialsView />` |
| `src/app/packages/page.tsx` | `/packages` — Header + `<PackagesView />` |
| `src/components/HomeShell.tsx` | Client wrapper that lifts the calculator's total so `<TopBannerNudge />` can sit above `<Header />` |

### Calculator (`/`)
| File | Role |
|---|---|
| `src/components/Calculator.tsx` | Client orchestrator — holds state, syncs URL, force-locks invisible fields (monthType, inboxOwnership, upworkFee) |
| `src/components/CostBreakdown.tsx` | Right-panel breakdown card + ROI Estimator + Submit Order button + Inbox Provider cost row |
| `src/components/CostBreakdown.tsx → RoiEstimator` | Collapsible AI ROI estimator (calls `/api/estimate-roi`) |
| `src/components/FloatingTotal.tsx` | Mobile sticky bottom bar |
| `src/components/OrderModal.tsx` | Calculator's order form |
| `src/components/sections/CampaignVolumeSection.tsx` | Lead volume slider (1.5k–50k) + EPP buttons |
| `src/components/sections/CampaignsSection.tsx` | Campaign Experiments 1-5 picker + tip distinguishing from A/B testing |
| `src/components/sections/CampaignSetupSummary.tsx` | "What You Get" 9-item list + compact stats + 4-phase timeline + inbox provider disclosure |
| `src/components/sections/AdvancedOptionsDisclosure.tsx` | Collapsible panel housing all hidden defaults + add-ons |
| `src/components/sections/DataSection.tsx` etc. | Individual config sections (rendered only inside Advanced Options) |
| `src/components/sections/AddOnsSection.tsx` | LinkedIn, CRM, drip, infra mgmt, Instantly setup, landing page checkboxes |

### Banner + nav
| File | Role |
|---|---|
| `src/components/TopBannerNudge.tsx` | Sticky top banner; tier-aware recommendation; sessionStorage dismissal |
| `src/components/TopNav.tsx` | Calculator / Trials / Packages nav with active highlight |
| `src/components/Header.tsx` | Hero copy per page variant (`calculator` / `trials` / `packages`) |

### Trials + Packages
| File | Role |
|---|---|
| `src/components/TrialsView.tsx` | Two pricing cards (1-2 / 3-5), `?p=high\|low` toggle, hidden footer button, Shift+P shortcut |
| `src/components/PackagesView.tsx` | Three tiers (Pilot/Growth/Scale), intro paragraph linking to trials/calculator |
| `src/components/InquiryModal.tsx` | Shared form modal for trial + package orders |
| `src/components/ResultsGallery.tsx` | Hardcoded campaign cards with metrics + modal |

### API routes
| File | Role |
|---|---|
| `src/app/api/send-order/route.ts` | Calculator order — client + owner email via Resend |
| `src/app/api/send-inquiry/route.ts` | Trial + package orders — client + owner email, kind-aware subject/body |
| `src/app/api/estimate-roi/route.ts` | AI ROI estimator (OpenAI) |

### Validation
| File | Role |
|---|---|
| `scripts/validate-pricing.ts` | Run via `npx tsx` — confirms pricing math + experiment pricing + coupons + legacy URL backward-compat |

---

## How to change prices

Edit `src/lib/pricing.config.ts` only. No other file needs touching for price changes.

```ts
// Example slots in PRICING:
inboxOwnership: { user_domains: 35, dfy: 50 }       // $ per 1k emails
dataSource: { dfy_scrape: 50, full_list: 20, ... }  // $ per 1k leads
copywriting: { finalized: 50, full_strategy: 125 }  // one-time
campaigns: { 1: 0, 2: 125, 3: 250, 4: 375, 5: 500 } // first included, +$125 each
support: { email: 100, slack_light: 200, slack_full: 375 }
volumeDiscounts: { 2000: 0, 4000: 0.05, 7500: 0.075, 10000: 0.10, 20000: 0.20, 40000: 0.25 }
brandedSetup: { baseSetupFee: 250, extraInboxThreshold: 50, extraPerInbox: 2 }
packageNudgeThreshold: 1500                         // banner fires at this total
packageTiers: { pilotMin: 1500, growthMin: 2450, scaleMin: 3450 }  // banner tier selection
pricePerAdditionalExperiment: 125
```

After any price change: run `npx tsx scripts/validate-pricing.ts` to confirm math holds, then `npm run build`.

**Before changing thresholds or default state**, re-read [`docs/pricing-system-reference.md`](docs/pricing-system-reference.md) §2 (defaults) and §8 (the 15 design decisions). The defaults are guardrails — changing them undoes intent.

---

## How to change package tiers (`/packages`)

Edit `src/components/PackagesView.tsx → TIERS`. Each tier:

```ts
{
  id: 'pilot' | 'growth' | 'scale',
  name: string,
  price: string,                  // displayed (e.g. '$1,500')
  priceNote: string,              // displayed (e.g. '/ month')
  positioning: string,            // 1-line audience hook
  features: string[],             // **bold** markdown supported
  emphasis?: boolean,             // visually emphasized tier
}
```

**If you change tier prices, also update `pricing.config.ts → packageTiers`** so the banner picks the right tier per user total.

---

## How to change trial pricing (`/trials`)

Edit `src/components/TrialsView.tsx → PACKAGES`. Each entry has a `prices: { high, low }` map. The default URL shows `high`. The toggle reaches `low` via `?p=low` or footer dot or Shift+P.

**Don't reintroduce a `mid` tier without justification** — it was tried and dropped (no psychological purpose; see [`docs/pricing-system-reference.md`](docs/pricing-system-reference.md) §11 "What we chose NOT to do").

---

## How to add a new calculator section / option

If adding a new visible section (rare — most additions belong inside Advanced Options):

### 1. Add the type
```ts
// src/lib/types.ts
export type MyOption = 'option_a' | 'option_b'
// Add to SelectionState: myOption: MyOption
```

### 2. Add pricing
```ts
// src/lib/pricing.config.ts
myOption: { option_a: 100, option_b: 200 }
```

### 3. Add to DEFAULT_STATE
```ts
// src/lib/pricing.ts
myOption: 'option_a'
```

### 4. Add URL param key
```ts
// src/lib/url-state.ts: handle in P map + parse() + serialize()
```

### 5. Create a section component
Copy `src/components/sections/EnrichmentsSection.tsx` as a template.

### 6. Wire it into the pricing logic
Add a line item inside `calculateTotal()` in `pricing.ts`.

### 7. Render it
- **Visible by default**: Add to `Calculator.tsx`
- **Hidden by default** (most likely): Add to `AdvancedOptionsDisclosure.tsx`

### 8. Validate
Run `npx tsx scripts/validate-pricing.ts`, then `npm run build`.

---

## URL state

Every calculator selection is encoded in the URL query string (short keys in `url-state.ts`). Sharing the URL restores the exact configuration; the URL is included in order emails.

Param keys: `s` setup · `l` leads · `e` epp · `i` inbox · `d` data · `en` enrich · `c` copy · `ca` campaigns · `r` reply · `su` support · `li` linkedin · `cr` crm · `dr` drip · `in` infra · `is` instantly · `lp` landing-page · `cp` coupon · `uw` upwork-fee · `mt` month-type

**Trial-page URL param**: `?p=high` (default, public) or `?p=low` (gated — only handed to select fit prospects we want as long-term clients; see [`docs/pricing-philosophy.md`](docs/pricing-philosophy.md) for routing rules and [`docs/pricing-system-reference.md`](docs/pricing-system-reference.md) §4 for the toggle mechanics).

**Legacy URLs** (old `s=full_dfy`, `i=user_domains_instantly`, etc.) parse cleanly — backward-compat handled in `url-state.ts`. Don't break this.

---

## Order flow

### Calculator (`/`) one-off
1. User configures, clicks "Submit Order"
2. `OrderModal` collects first name / last name / company domain / email / optional description
3. POST to `/api/send-order` → fires **two** Resend emails:
   - **Client**: full breakdown, 4-phase timeline, Calendly link to `/pilot-campaign-launch`
   - **Owner** (`owner@bleedai.com`): client details, breakdown, "View Their Configuration" link

### Trials + Packages
1. User clicks "Start Your Trial" (trials) or "Get Started" (packages)
2. `InquiryModal` collects the same fields
3. POST to `/api/send-inquiry` with `kind: 'trial' | 'package'` → fires two Resend emails (kind-aware copy)
4. Success state offers Calendly link to `bleedai.com/book-call/`

**No Stripe yet** — manual invoice goes out after sales call confirms fit. See [`docs/pricing-system-reference.md`](docs/pricing-system-reference.md) §8.9 for why.

---

## Environment variables

| Key | Value | Where |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Vercel + `.env.local` |
| `FROM_EMAIL` | `BleedAI <noreply@updates.bleedai.com>` | Vercel + `.env.local` |
| `OpenAI` | OpenAI API key (legacy var name) | Vercel + `.env.local` |

`.env.local` is gitignored. Add new env vars in Vercel dashboard → Settings → Environment Variables, then redeploy.

---

## Brand

- Background: `#050508`
- Accent (crimson): `#B1130F`
- Hover accent: `#d41510`
- Muted text: `text-gray-400` / `text-gray-500`
- Font: Inter (Google Fonts, loaded in `layout.tsx`)
- Logo: `public/bleed-ai-logo.svg`
- Favicon: `src/app/icon.svg` (Next.js App Router auto-picks)

---

## Security

- `.claude/` is gitignored (stores command history which may contain tokens)
- `.env*` is gitignored — never commit
- Resend is lazily initialized in `route.ts` (build won't fail without `RESEND_API_KEY`)
- Email regex validation on both client (`OrderModal` / `InquiryModal`) and server (route handlers)
- Pre-commit hook (`.githooks/pre-commit`) blocks token-like strings from being committed

---

## Validation harness

`scripts/validate-pricing.ts` exercises:
- Floor / typical / ceiling configs (totals match expectations)
- Campaign experiments 1-5 (line item == `(n-1) × $125`)
- All six coupon codes (discount math is correct)
- Six legacy URL patterns (backward-compat doesn't crash)

Run after any change to `pricing.config.ts`, `pricing.ts`, or `url-state.ts`:

```bash
npx tsx scripts/validate-pricing.ts
```

If output shows ✗ on any line, fix before pushing.
