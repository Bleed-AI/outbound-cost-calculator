# Outbound Cost Calculator — Developer Guide


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

BleedAI branded pricing calculator for cold outreach campaigns.
Users configure options → see a live total → submit an order → two emails fire (client + owner).

## Deployment

- **GitHub**: `Bleed-AI/outbound-cost-calculator` (public, `main` branch)
- **Vercel**: auto-deploys on every `git push origin main` — live in ~30s
- **URL**: `calculator.bleedai.com` (CNAME → `cname.vercel-dns.com`)
- **Env vars set in Vercel**: `RESEND_API_KEY`, `FROM_EMAIL`

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Resend (email) · Vercel

## Dev Commands

```bash
npm run dev     # localhost:3000
npm run build   # production build + TypeScript check (run before every push)
```

## Git / Deploy Workflow

**Always run `npm run build` after making changes to catch TypeScript errors.**

**Do NOT push to GitHub until the user explicitly says so.** The user reviews changes locally first before deploying. Only commit and push when asked (e.g. "push it", "commit and push", "update github").

---

## File Map

| File | What it does |
|---|---|
| `src/lib/pricing.config.ts` | **All prices & rates** — edit this to change any dollar amount |
| `src/lib/pricing.ts` | `calculateTotal()`, `DEFAULT_STATE`, `COUPON_CODES`, `LEADS_OPTIONS` |
| `src/lib/types.ts` | TypeScript interfaces: `SelectionState`, `PricingResult`, `LineItem` |
| `src/lib/url-state.ts` | URL ↔ state serialization (short param keys) |
| `src/components/Calculator.tsx` | Client orchestrator — holds state, syncs URL, renders all sections |
| `src/components/CostBreakdown.tsx` | Right-panel breakdown, coupon Apply/Remove logic |
| `src/components/FloatingTotal.tsx` | Sticky bottom bar with live total |
| `src/components/OrderModal.tsx` | Modal form — collects name/company/email/description, posts to API |
| `src/components/ResultsGallery.tsx` | Bottom gallery — hardcoded campaign cards with metrics + modal |
| `src/components/Header.tsx` | Logo (links to bleedai.com) + hero title |
| `src/components/RadioOption.tsx` | Reusable radio card (supports `strikePrice` for "Included" display) |
| `src/components/sections/*.tsx` | One file per calculator section |
| `src/app/api/send-order/route.ts` | POST handler — validates payload, sends emails via Resend |
| `src/app/page.tsx` | Root page — renders Header, Calculator, ResultsGallery |
| `src/app/icon.svg` | Favicon (red square with "B") — Next.js picks this up automatically |
| `public/bleed-ai-logo.svg` | BleedAI wordmark used in the header |
| `public/campaign-results/*.png` | Campaign screenshot images (7 PNGs) |

---

## Pricing Engine (`src/lib/pricing.ts`)

### Flow of `calculateTotal(state)`

```
1. Fixed costs   → setup fee + copywriting + campaign strategies + n8n build fee
2. Variable costs → per-1k-email or per-1k-lead rates × multiplier (volume discount)
3. Add-ons       → linkedin, crm, drip sequence, infra management
4. baseTotal     → fixed + variable + addons  (used for support waiver checks)
5. Support       → check if baseTotal >= waiver threshold → cost = 0 if so
6. preDiscountTotal → baseTotal + support
7. Coupon        → apply % off preDiscountTotal if code matches COUPON_CODES
8. total         → preDiscountTotal - couponDiscountAmount
```

### Volume Discount

Applies only to variable (per-1k) costs. Rates are in `pricing.config.ts → volumeDiscounts`.

### Campaign Strategy Inclusion Tiers

```ts
// In pricing.ts
includedCampaignTier(leads):
  leads >= 10000 → 3 strategies included free
  leads >= 7500  → 2 strategies included free
  else           → 1 (no bonus)
```

Campaign cost = `price[selected] - price[includedTier]` (never negative).

### Support Auto-Waiver

`pricing.config.ts → supportWaiverThresholds`:
- `email`: free if baseTotal ≥ $500
- `slack_light`: free if baseTotal ≥ $1,000
- `slack_full`: free if baseTotal ≥ $2,000

### Infrastructure Management

`$25/1k emails/month`. Auto-checked when `inboxOwnership === 'user_domains_instantly'`.
Waived (shown as $0) if `baseTotal >= infraWaiverThreshold` ($2,000).

---

## How to Change Prices

Edit `src/lib/pricing.config.ts` only. No other file needs touching for price changes.

```ts
// Example entries in PRICING object:
setup: { full_dfy: 1500, branded_only: 500 }
inboxOwnership: { user_domains: 5, user_domains_instantly: 3, dfy: 8 }  // per 1k emails
dataSource: { dfy_scrape: 20, full_list: 5, ... }  // per 1k leads
volumeDiscounts: { 2000: 0, 4000: 0.03, 7500: 0.08, ... }
supportWaiverThresholds: { email: 500, slack_light: 1000, slack_full: 2000 }
infraWaiverThreshold: 2000
hourlyRate: 150
```

---

## How to Add a New Section / Option

### 1. Add the type to `src/lib/types.ts`
```ts
export type MyOption = 'option_a' | 'option_b'
// Add to SelectionState:
myOption: MyOption
```

### 2. Add pricing to `src/lib/pricing.config.ts`
```ts
myOption: { option_a: 100, option_b: 200 }
```

### 3. Add to `DEFAULT_STATE` in `src/lib/pricing.ts`
```ts
myOption: 'option_a'
```

### 4. Add URL param key in `src/lib/url-state.ts`
```ts
// In KEYS map add e.g.: myOption: 'mo'
// In serialize() and parse() handle it
```

### 5. Create a section component in `src/components/sections/`
Copy an existing one (e.g. `EnrichmentsSection.tsx`) as a template.

### 6. Wire it into the pricing logic in `src/lib/pricing.ts`
Add a line item inside `calculateTotal()`.

### 7. Add it to `Calculator.tsx`
Import the section component, add `<MySection value={state.myOption} onChange={(v) => update('myOption', v)} />`.

---

## Discount Codes

Defined in `src/lib/pricing.ts`:
```ts
export const COUPON_CODES: Record<string, number> = {
  NEW5: 5,       // 5% off
  SPECIAL10: 10, // 10% off
  VIP15: 15,     // 15% off
  ULTRA20: 20,   // 20% off
}
```

To add a new code: add a key/value to `COUPON_CODES`. That's it.

The UX (Apply button, green banner, Remove button, "Invalid" error) is all in `CostBreakdown.tsx`.
The discount applies to `preDiscountTotal` (after volume discount, before coupon).
Coupon code is stored in URL state (param key `cp`) so shared links preserve it.

---

## Results Gallery (`src/components/ResultsGallery.tsx`)

Cards are **hardcoded** in the `CAMPAIGNS` array at the top of the file — data is not derived from filenames. Each entry:

```ts
{
  title: string        // Display name
  headline: string     // One-line results summary
  metrics: [           // Exactly 4 metrics shown in the 2×2 grid
    { label: string, value: string }
  ]
  image: string        // Path under /campaign-results/
}
```

To **add a new campaign card**:
1. Drop the PNG into `public/campaign-results/`
2. Add a new entry to the `CAMPAIGNS` array in `ResultsGallery.tsx`
3. Extract the 4 key metrics from the screenshot (sequences, reply rate, positive reply rate, opportunities/pipeline value)

Clicking the screenshot thumbnail opens an `ImageModal` with a scrollable full-size image and larger metrics.

---

## URL State

Every selection is encoded in the URL query string (short param keys defined in `url-state.ts`).
Sharing the URL restores the exact configuration. The full URL is included in order emails.

Current param keys (from `url-state.ts`):
`s` setup · `l` leads · `e` emails/prospect · `i` inbox · `d` data · `en` enrichments ·
`c` copywriting · `ca` campaigns · `r` reply · `su` support · `li` linkedin · `cr` crm ·
`dr` drip · `in` infra · `cp` coupon

---

## Order Flow

1. User clicks "Submit Order" → `OrderModal` opens
2. User fills: First Name, Last Name, Company Website, Email, optional description
3. POST to `/api/send-order` with full payload (line items, total, coupon info, shareUrl)
4. Resend fires two emails simultaneously:
   - **Client**: full breakdown, volume stats, coupon discount, Calendly CTA button
   - **Owner** (`owner@bleedai.com`): client details, breakdown, coupon discount, "View Their Configuration" link

Calendly link (both emails + success state): `https://calendly.com/bleedai/pilot-campaign-launch`

---

## Environment Variables

| Key | Value | Where |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Vercel + `.env.local` |
| `FROM_EMAIL` | `BleedAI <noreply@updates.bleedai.com>` | Vercel + `.env.local` |

`.env.local` is gitignored. Never commit it. Add/change env vars in Vercel dashboard → Settings → Environment Variables, then redeploy.

---

## Brand

- Background: `#050508`
- Accent (crimson): `#B1130F`
- Hover accent: `#d41510`
- Muted text: `text-gray-400` / `text-gray-500`
- Font: Inter (Google Fonts, loaded in `layout.tsx`)
- Logo: `public/bleed-ai-logo.svg`
- Favicon: `src/app/icon.svg` (Next.js App Router auto-picks this up)

---

## Security

- `.claude/` is gitignored (stores command history which may contain tokens)
- `.env*` is gitignored — never commit
- Resend is lazily initialized in `route.ts` (build won't fail without `RESEND_API_KEY`)
- Email regex validation on both client (`OrderModal`) and server (`route.ts`)
