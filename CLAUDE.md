# Outbound Cost Calculator

BleedAI branded pricing calculator for cold outreach campaign configuration.
Clients select options → see live total → submit an order → emails sent to client + owner@bleedai.com.

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
| `public/campaign-results/` | Drop campaign screenshots here |

## Brand
- Background: `#050508`
- Accent (crimson): `#B1130F`
- Text: `#FFFFFF`
- Logo: `public/bleed-ai-logo.svg`

## Environment Variables

```
RESEND_API_KEY=re_...        # Required for email sending
FROM_EMAIL=BleedAI <noreply@bleedai.com>  # Optional, defaults to Resend test sender
```

Set in `.env.local` for local dev. Add same vars in Vercel dashboard → Settings → Environment Variables.

## Dev Commands

```bash
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build check
npm run lint    # ESLint
```

## Updating Prices

1. Edit `src/lib/pricing.config.ts`
2. `git add -p src/lib/pricing.config.ts && git commit -m "pricing: update [what changed]"`
3. `git push` → Vercel auto-deploys → live in ~30 seconds

## Adding Campaign Result Screenshots

1. Drop images (PNG/JPG) into `public/campaign-results/`
2. Pass the paths to `<ResultsGallery images={['/campaign-results/result1.png', ...]} />` in `src/app/page.tsx`
3. Push → live

## URL State

Every selection is encoded in the URL query string (short param keys). Sharing or pasting the URL
in any browser restores the identical configuration. The full URL is included in order emails.

## Email Flow (Submit Order)

1. Client fills name / company / email in the `OrderModal`
2. POST to `/api/send-order`
3. Resend fires two emails simultaneously:
   - Client confirmation with full breakdown + shareable URL
   - Owner notification to `owner@bleedai.com` with client details + breakdown

To use a custom sender domain, verify `bleedai.com` in Resend dashboard, then set `FROM_EMAIL`.
