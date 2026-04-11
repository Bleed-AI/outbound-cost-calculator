import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import type { LineItem } from '@/lib/types'

const OWNER_EMAIL = 'owner@bleedai.com'
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'BleedAI <onboarding@resend.dev>'
const CALENDLY_URL = 'https://calendly.com/bleedai/pilot-campaign-launch'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

interface OrderPayload {
  firstName: string
  lastName: string
  companyDomain: string
  email: string
  description?: string
  total: number
  lineItems: LineItem[]
  discountAmount: number
  discountPercent: number
  couponDiscountAmount: number
  couponDiscountPercent: number
  couponCode: string
  upworkFeeAmount: number
  totalEmails: number
  shareUrl: string
}

export async function POST(req: NextRequest) {
  let payload: OrderPayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    firstName,
    lastName,
    companyDomain,
    email,
    description,
    total,
    lineItems,
    discountAmount,
    discountPercent,
    couponDiscountAmount,
    couponDiscountPercent,
    couponCode,
    upworkFeeAmount,
    totalEmails,
    shareUrl,
  } = payload

  if (!firstName || !lastName || !companyDomain || !email || typeof total !== 'number') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const fullName = `${firstName} ${lastName}`
  const formattedTotal = fmt(total)

  const monthlyItems = lineItems.filter((i) => i.period === 'monthly')
  const oneTimeItems = lineItems.filter((i) => i.period === 'one-time')
  const monthlySubtotal = monthlyItems.reduce((s, i) => s + i.amount, 0)
  const oneTimeSubtotal = oneTimeItems.reduce((s, i) => s + i.amount, 0)

  const clientHtml = buildEmail({
    title: 'Your Campaign Order',
    preheader: `Campaign total: ${formattedTotal} — ${totalEmails.toLocaleString()} emails`,
    body: `
      <p style="color:#8b8b9e;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hi ${firstName}, thanks for configuring your campaign. Here&rsquo;s your full breakdown.
        We&rsquo;ll review everything and be in touch shortly.
      </p>

      <!-- Volume highlight -->
      ${buildStatCards([
        { label: 'Total Emails', value: totalEmails.toLocaleString() },
        { label: 'Campaign Total', value: formattedTotal, highlight: true },
      ])}

      <!-- Line items -->
      ${buildLineItemSection('Monthly / Recurring', monthlyItems, discountPercent)}
      ${buildLineItemSection('One-Time Costs', oneTimeItems)}

      <!-- Subtotals -->
      ${buildSubtotals(monthlySubtotal, oneTimeSubtotal, totalEmails)}

      <!-- Discounts -->
      ${buildDiscounts(discountAmount, discountPercent, couponDiscountAmount, couponDiscountPercent, couponCode, upworkFeeAmount)}

      <!-- Total -->
      ${buildTotalBar(formattedTotal)}

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
        <tr><td style="background:#0c0c14;border:1px solid rgba(177,19,15,0.25);border-radius:12px;padding:24px;">
          <p style="color:#f0f0f4;font-size:16px;font-weight:700;margin:0 0 6px;">Next Step: Book Your Onboarding Call</p>
          <p style="color:#8b8b9e;font-size:13px;margin:0 0 20px;line-height:1.6;">
            Schedule a quick call so we can review your configuration and get your pilot campaign launched.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#B1130F;border-radius:8px;">
            <a href="${CALENDLY_URL}" style="display:inline-block;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;text-decoration:none;letter-spacing:0.02em;">
              Book Your Onboarding Call &rarr;
            </a>
          </td></tr></table>
        </td></tr>
      </table>

      <!-- Config link -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
        <tr><td align="center">
          <a href="${shareUrl}" style="display:inline-block;color:#5a5a6e;font-size:12px;text-decoration:none;padding:10px 20px;border:1px solid rgba(255,255,255,0.08);border-radius:8px;">
            View Your Full Configuration &rarr;
          </a>
        </td></tr>
      </table>
    `,
  })

  const ownerHtml = buildEmail({
    title: `New Order — ${companyDomain}`,
    preheader: `${fullName} (${companyDomain}) — ${formattedTotal}`,
    body: `
      <!-- Client details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${buildDetailRow('Name', fullName)}
        ${buildDetailRow('Company', companyDomain)}
        ${buildDetailRow('Email', `<a href="mailto:${email}" style="color:#B1130F;text-decoration:none;">${email}</a>`)}
        ${buildDetailRow('Total Emails', totalEmails.toLocaleString())}
        ${description ? buildDetailRow('Description', description) : ''}
      </table>

      ${buildStatCards([
        { label: 'Campaign Total', value: formattedTotal, highlight: true },
        { label: 'Emails', value: totalEmails.toLocaleString() },
      ])}

      ${buildLineItemSection('Monthly / Recurring', monthlyItems, discountPercent)}
      ${buildLineItemSection('One-Time Costs', oneTimeItems)}
      ${buildSubtotals(monthlySubtotal, oneTimeSubtotal, totalEmails)}
      ${buildDiscounts(discountAmount, discountPercent, couponDiscountAmount, couponDiscountPercent, couponCode, upworkFeeAmount)}
      ${buildTotalBar(formattedTotal)}

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#B1130F;border-radius:8px;">
            <a href="${shareUrl}" style="display:inline-block;color:#ffffff;font-weight:600;font-size:14px;padding:12px 28px;text-decoration:none;">
              View Their Configuration
            </a>
          </td></tr></table>
        </td></tr>
      </table>
    `,
  })

  try {
    await Promise.all([
      getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your BleedAI Campaign Order — ${formattedTotal}`,
        html: clientHtml,
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        subject: `New Order — ${companyDomain} — ${formattedTotal}`,
        html: ownerHtml,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}

/* ── Formatting helpers ─────────────────────────────────── */

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

const PERIOD_LABELS: Record<string, string> = {
  'one-time': '',
  monthly: '/mo',
  'per-campaign': '/campaign',
}

/* ── Email building blocks ──────────────────────────────── */

function buildDetailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;color:#5a5a6e;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);width:120px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#f0f0f4;font-size:13px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">${value}</td>
    </tr>
  `
}

function buildStatCards(stats: { label: string; value: string; highlight?: boolean }[]) {
  const cells = stats.map((s) => `
    <td style="width:${Math.floor(100 / stats.length)}%;padding:16px;background:${s.highlight ? 'rgba(177,19,15,0.08)' : '#0c0c14'};border:1px solid ${s.highlight ? 'rgba(177,19,15,0.2)' : 'rgba(255,255,255,0.06)'};border-radius:10px;text-align:center;">
      <div style="color:#5a5a6e;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">${s.label}</div>
      <div style="color:${s.highlight ? '#f0f0f4' : '#f0f0f4'};font-size:${s.highlight ? '24px' : '20px'};font-weight:800;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;">${s.value}</div>
    </td>
  `).join('<td style="width:12px;"></td>')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>${cells}</tr>
    </table>
  `
}

function buildLineItemSection(title: string, items: LineItem[], discountPercent?: number) {
  if (items.length === 0) return ''

  const discountNote = discountPercent && discountPercent > 0
    ? ` <span style="color:#34d399;font-size:10px;font-weight:500;">(${discountPercent}% volume discount applied)</span>`
    : ''

  const rows = items.map((item) => `
    <tr>
      <td style="padding:8px 0;color:#8b8b9e;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);">${item.label}</td>
      <td style="padding:8px 0;color:#f0f0f4;font-size:13px;font-weight:500;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;">
        ${fmt(item.amount)}
        <span style="color:#3a3a4a;font-size:11px;font-weight:400;font-family:inherit;">${PERIOD_LABELS[item.period] ?? ''}</span>
      </td>
    </tr>
  `).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
      <tr>
        <td colspan="2" style="padding:12px 0 6px;color:#3a3a4a;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;">
          ${title}${discountNote}
        </td>
      </tr>
      ${rows}
    </table>
  `
}

function buildSubtotals(monthlySubtotal: number, oneTimeSubtotal: number, totalEmails: number) {
  const rows: string[] = []
  if (monthlySubtotal > 0) {
    rows.push(`
      <tr>
        <td style="padding:6px 0;color:#5a5a6e;font-size:12px;">
          Monthly / Recurring
          <span style="color:#3a3a4a;font-size:11px;">(for ${totalEmails.toLocaleString()} emails/mo)</span>
        </td>
        <td style="padding:6px 0;color:#8b8b9e;font-size:12px;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;white-space:nowrap;">${fmt(monthlySubtotal)}/mo</td>
      </tr>
    `)
  }
  if (oneTimeSubtotal > 0) {
    rows.push(`
      <tr>
        <td style="padding:6px 0;color:#5a5a6e;font-size:12px;">One-Time</td>
        <td style="padding:6px 0;color:#8b8b9e;font-size:12px;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;white-space:nowrap;">${fmt(oneTimeSubtotal)}</td>
      </tr>
    `)
  }
  if (rows.length === 0) return ''
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${rows.join('')}</table>`
}

function buildDiscounts(
  discountAmount: number,
  discountPercent: number,
  couponDiscountAmount: number,
  couponDiscountPercent: number,
  couponCode: string,
  upworkFeeAmount: number
) {
  let html = ''

  if (discountAmount > 0) {
    html += `
      <div style="display:flex;justify-content:space-between;padding:6px 0;">
        <span style="color:#5a5a6e;font-size:13px;">Volume Discount (${discountPercent}% off)</span>
        <span style="color:#34d399;font-size:13px;font-weight:600;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;">-${fmt(discountAmount)}</span>
      </div>
    `
  }

  if (couponDiscountAmount > 0) {
    html += `
      <div style="display:flex;justify-content:space-between;padding:6px 0;">
        <span style="color:#5a5a6e;font-size:13px;">
          Coupon <span style="font-family:'SF Mono',SFMono-Regular,Menlo,monospace;background:#111119;padding:2px 8px;border-radius:4px;font-size:12px;color:#8b8b9e;">${couponCode}</span> (${couponDiscountPercent}% off)
        </span>
        <span style="color:#34d399;font-size:13px;font-weight:600;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;">-${fmt(couponDiscountAmount)}</span>
      </div>
    `
  }

  if (upworkFeeAmount > 0) {
    html += `
      <div style="display:flex;justify-content:space-between;padding:6px 0;">
        <span style="color:#5a5a6e;font-size:13px;">Upwork platform fee (+10%)</span>
        <span style="color:#8b8b9e;font-size:13px;font-weight:600;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;">+${fmt(upworkFeeAmount)}</span>
      </div>
    `
  }

  return html
}

function buildTotalBar(formattedTotal: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
      <tr><td colspan="2" style="height:2px;background:linear-gradient(to right,#B1130F,rgba(177,19,15,0.2));border-radius:1px;"></td></tr>
      <tr>
        <td style="padding:16px 0 0;color:#f0f0f4;font-size:15px;font-weight:600;">Campaign Total</td>
        <td style="padding:16px 0 0;color:#f0f0f4;font-size:28px;font-weight:800;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;">${formattedTotal}</td>
      </tr>
    </table>
  `
}

function buildEmail({ title, preheader, body }: { title: string; preheader: string; body: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="color-scheme" content="dark">
      <meta name="supported-color-schemes" content="dark">
      <!--[if mso]><style>table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
    </head>
    <body style="margin:0;padding:0;background:#06060a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
      <!-- Preheader (hidden preview text) -->
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#06060a;padding:32px 16px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

            <!-- Logo -->
            <tr>
              <td style="padding:0 0 32px;">
                <img src="https://calculator.bleedai.com/bleed-ai-logo.svg" alt="BleedAI" width="100" style="display:block;height:auto;" />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:0 0 8px;">
                <h1 style="color:#f0f0f4;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.02em;">${title}</h1>
              </td>
            </tr>

            <!-- Gradient rule -->
            <tr>
              <td style="padding:0 0 28px;">
                <div style="height:2px;background:linear-gradient(to right,#B1130F,transparent 60%);border-radius:1px;"></div>
              </td>
            </tr>

            <!-- Body card (double-bezel) -->
            <tr>
              <td style="background:#0c0c14;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:1px;">
                <div style="background:#111119;border-radius:15px;padding:28px 24px;">
                  ${body}
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:28px 0 0;text-align:center;">
                <div style="height:1px;background:linear-gradient(to right,transparent,rgba(255,255,255,0.06),transparent);margin-bottom:20px;"></div>
                <p style="color:#3a3a4a;font-size:11px;margin:0;line-height:1.6;">
                  BleedAI &mdash; We Install Revenue Systems that Scale B2B Firms in Weeks<br>
                  <a href="https://bleedai.com" style="color:#5a5a6e;text-decoration:none;">bleedai.com</a>
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}
