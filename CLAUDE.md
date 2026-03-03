# Outbound Cost Calculator

BleedAI branded pricing calculator for cold outreach campaign configuration.
Clients select options → see live total → submit an order → emails sent to client + owner@bleedai.com.

## Deployment

- **GitHub repo**: `Bleed-AI/outbound-cost-calculator` (public)
- **Vercel project**: `owner-5498's projects` → `outbound-cost-calculator`
- **Auto-deploy**: every `git push` to `main` → live in ~30s
- **RESEND_API_KEY** is set as a Vercel environment variable

## Stack
- Next.js 15 (App Router) · TypeScript · Tailwind CSS v4
- Resend (email) · Vercel (hosting) · GitHub (source)

## Key Files

| File | Purpose |
|---|---|
| `src/lib/pricing.config.ts` | **Edit this to change any price or discount rate** |
| `src/lib/pricing.ts` | `calculateTotal()` logic + `DEFAULT_STATE` |
| `src/lib/url-state.ts` | URL ↔ `SelectionState` serialization |
| `src/lib/types.ts` | All TypeScript interfaces |
| `src/components/Calculator.tsx` | Main client component — state + URL sync |
| `src/app/api/send-order/route.ts` | POST endpoint — sends emails via Resend |
| `src/app/page.tsx` | Passes campaign result images to ResultsGallery |
| `public/campaign-results/` | Campaign screenshot images (7 offer PNGs) |

## Brand
- Background: `#050508`
- Accent (crimson): `#B1130F`
- Text: `#FFFFFF`
- Logo: `public/bleed-ai-logo.svg`

## Environment Variables

```
RESEND_API_KEY=re_...         # Required — set in Vercel + .env.local
FROM_EMAIL=BleedAI <noreply@updates.bleedai.com>  # Set after Resend domain verification
```

Set in `.env.local` for local dev (gitignored — never committed).
Add/update in Vercel dashboard → project → Settings → Environment Variables.

## Dev Commands

```bash
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build check
npm run lint    # ESLint
```

## Updating Prices

1. Edit `src/lib/pricing.config.ts`
2. `git add src/lib/pricing.config.ts && git commit -m "pricing: update [what]"`
3. `git push` → Vercel auto-deploys → live in ~30 seconds

## Adding Campaign Result Screenshots

1. Drop images into `public/campaign-results/`
2. Add the path to the `images={[...]}` array in `src/app/page.tsx`
3. Push → live

## URL State

Every selection is encoded in the URL query string (short param keys).
Sharing the URL in any browser restores the identical configuration.
The full URL is included in order submission emails.

## Email Flow (Submit Order)

1. Client fills name / company / email in the OrderModal
2. POST to `/api/send-order`
3. Resend fires two emails simultaneously:
   - Client confirmation with full breakdown + shareable URL
   - Owner notification to `owner@bleedai.com` with client details + breakdown

## Resend Domain Setup (in progress)

Setting up `updates.bleedai.com` as sending domain so FROM shows as
`BleedAI <noreply@updates.bleedai.com>` instead of `onboarding@resend.dev`.

Steps:
1. Add domain in Resend dashboard → get DNS records
2. Add TXT/MX/DKIM records to DNS provider (wherever bleedai.com is hosted)
3. Verify in Resend
4. Add `FROM_EMAIL=BleedAI <noreply@updates.bleedai.com>` to Vercel env vars
5. Redeploy (or wait for next push)

## Security Notes

- `.claude/` is gitignored — it stores Claude Code command history (can contain tokens)
- `.env*` is gitignored — never commit `.env.local`
- Rotate any API keys that appear in conversation history or in `.claude/settings.local.json`
