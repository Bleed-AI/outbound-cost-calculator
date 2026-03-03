import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import type { LineItem } from '@/lib/types'

const OWNER_EMAIL = 'owner@bleedai.com'
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'BleedAI <onboarding@resend.dev>'

// Lazily initialized so build doesn't fail without RESEND_API_KEY
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
  name: string
  company: string
  email: string
  total: number
  lineItems: LineItem[]
  discountAmount: number
  discountPercent: number
  shareUrl: string
}

export async function POST(req: NextRequest) {
  let payload: OrderPayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, company, email, total, lineItems, discountAmount, discountPercent, shareUrl } =
    payload

  if (!name || !company || !email || typeof total !== 'number') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(total)

  const lineItemsHtml = lineItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;color:#aaaaaa;font-size:13px;border-bottom:1px solid #1a1a2a;">${item.label}</td>
          <td style="padding:6px 0;color:#ffffff;font-size:13px;text-align:right;border-bottom:1px solid #1a1a2a;white-space:nowrap;">
            ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(item.amount)}
            <span style="color:#555;font-size:11px;"> ${item.period === 'one-time' ? '' : item.period === 'monthly' ? '/mo' : '/campaign'}</span>
          </td>
        </tr>`
    )
    .join('\n')

  const clientHtml = buildEmail({
    title: 'Your BleedAI Campaign Order',
    body: `
      <p style="color:#aaaaaa;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi ${name}, thanks for submitting your campaign configuration. Here&rsquo;s a full
        summary of your selections. We&rsquo;ll review and be in touch shortly.
      </p>
      ${buildBreakdownTable(lineItemsHtml, formattedTotal, discountAmount, discountPercent)}
      <div style="margin:24px 0;">
        <a href="${shareUrl}" style="display:inline-block;background:#B1130F;color:#ffffff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          View Your Configuration
        </a>
      </div>
      <p style="color:#555555;font-size:12px;margin:0;">
        This link captures all your selections exactly — you can share or revisit it any time.
      </p>
    `,
  })

  const ownerHtml = buildEmail({
    title: `New Order — ${company}`,
    body: `
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="color:#aaaaaa;font-size:13px;padding:4px 0;">Name</td><td style="color:#ffffff;font-size:13px;text-align:right;">${name}</td></tr>
        <tr><td style="color:#aaaaaa;font-size:13px;padding:4px 0;">Company</td><td style="color:#ffffff;font-size:13px;text-align:right;">${company}</td></tr>
        <tr><td style="color:#aaaaaa;font-size:13px;padding:4px 0;">Email</td><td style="color:#ffffff;font-size:13px;text-align:right;"><a href="mailto:${email}" style="color:#e84040;">${email}</a></td></tr>
      </table>
      ${buildBreakdownTable(lineItemsHtml, formattedTotal, discountAmount, discountPercent)}
      <div style="margin:24px 0;">
        <a href="${shareUrl}" style="display:inline-block;background:#B1130F;color:#ffffff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          View Their Configuration
        </a>
      </div>
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
        subject: `New Order — ${company} — ${formattedTotal}`,
        html: ownerHtml,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}

function buildBreakdownTable(
  lineItemsHtml: string,
  formattedTotal: string,
  discountAmount: number,
  discountPercent: number
): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${lineItemsHtml}
    </table>
    ${
      discountAmount > 0
        ? `<p style="color:#4ade80;font-size:13px;margin:0 0 8px;">
            Volume discount (${discountPercent}% off): -${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(discountAmount)}
          </p>`
        : ''
    }
    <div style="border-top:2px solid #B1130F;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
      <span style="color:#ffffff;font-size:16px;font-weight:700;">Campaign Total</span>
      <span style="color:#ffffff;font-size:22px;font-weight:800;">${formattedTotal}</span>
    </div>
  `
}

function buildEmail({ title, body }: { title: string; body: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:32px 16px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
            <!-- Header -->
            <tr>
              <td style="padding:0 0 24px;">
                <div style="background:#B1130F;height:3px;border-radius:2px;margin-bottom:24px;"></div>
                <span style="color:#ffffff;font-size:22px;font-weight:800;">${title}</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="background:#0d0d14;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;">
                ${body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 0 0;text-align:center;">
                <p style="color:#333333;font-size:11px;margin:0;">
                  BleedAI &mdash; We Install Revenue Systems that Scale B2B Firms in Weeks<br>
                  <a href="https://bleedai.com" style="color:#555555;">bleedai.com</a>
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
