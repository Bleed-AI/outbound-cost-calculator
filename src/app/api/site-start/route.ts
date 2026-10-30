import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

// The start popup on bleedai.com (Taha 2026-10-30). The main site is a static export and cannot send
// email, so its "Book a call" and "Start a free trial" popups post here. Two Resend emails go out,
// like send-inquiry: one to the visitor with what they picked and the calendar link, one to the owner.

const OWNER_EMAIL = 'owner@bleedai.com'
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'BleedAI <onboarding@resend.dev>'
const CALENDLY = 'https://calendly.com/bleedai/bleedai-start-your-services-or-a-2-week-free-trial'

const ALLOWED = [/^https:\/\/(www\.)?bleedai\.com$/, /^https:\/\/bleed-ai-main-website[a-z0-9-]*\.vercel\.app$/, /^http:\/\/localhost:\d+$/]

function cors(origin: string | null): Record<string, string> {
  const ok = origin && ALLOWED.some((re) => re.test(origin))
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://bleedai.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: cors(req.headers.get('origin')) })
}

interface Line { name: string; detail?: string }
interface StartPayload {
  mode: 'book' | 'trial'
  name: string
  email: string
  website: string
  note?: string
  sellsTo?: string
  selectionLabel?: string
  lines?: Line[]
  priceLabel?: string
  page?: string
  hp?: string // honeypot: real visitors leave it empty
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

export async function POST(req: NextRequest) {
  const headers = cors(req.headers.get('origin'))
  let p: StartPayload
  try {
    p = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers })
  }
  if (p.hp) return NextResponse.json({ ok: true }, { headers })
  if (p.mode !== 'book' && p.mode !== 'trial') return NextResponse.json({ error: 'Invalid mode' }, { status: 400, headers })
  if (!p.name?.trim() || !p.email?.trim() || !p.website?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers })
  }

  const lines = (p.lines ?? []).slice(0, 20)
  const first = p.name.trim().split(/\s+/)[0]
  const trial = p.mode === 'trial'
  const bookUrl = `${CALENDLY}?name=${encodeURIComponent(p.name.trim())}&email=${encodeURIComponent(p.email.trim())}`

  const lineRows = lines
    .map((l) => row(esc(l.name), l.detail ? esc(l.detail) : ''))
    .join('')

  const intro = trial
    ? `Thanks for starting a free trial. It runs for 2 weeks on the ${lines.length === 1 ? 'service' : '1 or 2 services'} below, so you see real work before you pay anything. We check the fit before the call, then on the call we agree what each service should do for you and start.`
    : `Thanks for sending us your plan. We review it before the call. On the call we confirm the details with you and launch within 48 hours. If anything in your pick would not suit your company, we will say so and suggest a swap.`

  const clientHtml = shell(
    trial ? 'Your free trial: next steps' : 'Your plan: next steps',
    `
      <p style="color:#d2d2dc;font-size:15px;line-height:1.7;margin:0 0 12px;">Hi ${esc(first)},</p>
      <p style="color:#8b8b9e;font-size:14px;line-height:1.7;margin:0 0 22px;">${intro}</p>
      ${lines.length ? `<p style="color:#f0f0f4;font-size:13px;font-weight:700;margin:0 0 8px;">${trial ? 'Your trial services' : esc(p.selectionLabel || 'Your services')}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">${lineRows}</table>` : ''}
      ${p.priceLabel && !trial ? `<p style="color:#8b8b9e;font-size:13px;margin:0 0 20px;">${esc(p.priceLabel)}</p>` : ''}
      ${button(bookUrl, 'Pick a time for your call', 'If you already booked from the page, you are all set. The invite is in your calendar.')}
    `,
  )

  const ownerHtml = shell(
    `${trial ? 'Free trial' : 'Book a call'}: ${esc(p.website)}`,
    `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
        ${row('Type', trial ? 'Free trial (1 to 2 services)' : 'Book a call to start')}
        ${row('Name', esc(p.name))}
        ${row('Email', `<a href="mailto:${esc(p.email)}" style="color:#ff5a52;text-decoration:none;">${esc(p.email)}</a>`)}
        ${row('Website', esc(p.website))}
        ${p.sellsTo ? row('Sells to', esc(p.sellsTo)) : ''}
        ${p.selectionLabel ? row('Picked', esc(p.selectionLabel)) : ''}
        ${p.priceLabel ? row('Price shown', esc(p.priceLabel)) : ''}
        ${p.note ? row('Note', esc(p.note)) : ''}
        ${p.page ? row('From page', esc(p.page)) : ''}
      </table>
      ${lines.length ? `<table width="100%" cellpadding="0" cellspacing="0">${lineRows}</table>` : ''}
      <p style="color:#8b8b9e;font-size:13px;line-height:1.6;margin:18px 0 0;">They were shown the calendar right after submitting. Check Calendly for the booking.</p>
    `,
  )

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: p.email.trim(),
        replyTo: OWNER_EMAIL,
        subject: trial ? 'Your BleedAI free trial: next steps' : 'Your BleedAI plan: next steps',
        html: clientHtml,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        replyTo: p.email.trim(),
        subject: `${trial ? 'Trial' : 'Book a call'}: ${p.website.trim()} (${p.name.trim()})${p.selectionLabel ? `, ${p.selectionLabel}` : ''}`,
        html: ownerHtml,
      }),
    ])
  } catch (err) {
    console.error('site-start email failed', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 502, headers })
  }
  return NextResponse.json({ ok: true }, { headers })
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#f0f0f4;font-size:13px;font-weight:600;vertical-align:top;width:42%;">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#8b8b9e;font-size:13px;line-height:1.5;vertical-align:top;">${value}</td>
  </tr>`
}

function button(href: string, label: string, sub: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">
    <tr><td style="background:#0c0c14;border:1px solid rgba(177,19,15,0.25);border-radius:12px;padding:22px;">
      <table cellpadding="0" cellspacing="0"><tr><td style="background:#B1130F;border-radius:8px;">
        <a href="${esc(href)}" style="display:inline-block;color:#ffffff;font-weight:700;font-size:14px;padding:13px 28px;text-decoration:none;">${label}</a>
      </td></tr></table>
      <p style="color:#8b8b9e;font-size:12px;margin:12px 0 0;line-height:1.6;">${sub}</p>
    </td></tr>
  </table>`
}

function shell(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#07070d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070d;padding:36px 16px;"><tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 0 20px;"><span style="color:#f0f0f4;font-size:20px;font-weight:800;">Bleed<span style="color:#B1130F;">AI</span></span></td></tr>
        <tr><td style="padding:0 0 14px;"><h1 style="color:#f0f0f4;font-size:22px;margin:0;">${title}</h1></td></tr>
        <tr><td style="background:#111119;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:26px 22px;">${body}</td></tr>
        <tr><td style="padding:22px 0 0;text-align:center;color:#5a5a6e;font-size:11px;line-height:1.6;">
          BleedAI, the last marketing team you'll ever hire<br><a href="https://bleedai.com" style="color:#5a5a6e;text-decoration:none;">bleedai.com</a>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`
}
