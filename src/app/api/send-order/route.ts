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
  totalEmails: number
  monthlyRecurringTotal: number
  oneTimeTotal: number
  month1ActualEmails: number
  brandedSetupFee: number
  inboxesNeeded: number
  domainsNeeded: number
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
    totalEmails,
    monthlyRecurringTotal,
    oneTimeTotal,
    month1ActualEmails,
    brandedSetupFee,
    inboxesNeeded,
    domainsNeeded,
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

  // Group line items by period for the email contract section.
  const campaignItems = lineItems.filter((i) => i.period === 'monthly')
  const setupItems = lineItems.filter((i) => i.period === 'one-time')

  const clientHtml = buildEmail({
    title: `${companyDomain} — Your BleedAI Campaign Proposal`,
    preheader: `Campaign total: ${formattedTotal} · ${totalEmails.toLocaleString()} email capacity`,
    body: `
      <p style="color:#d2d2dc;font-size:15px;line-height:1.7;margin:0 0 12px;">
        Hi ${firstName},
      </p>
      <p style="color:#8b8b9e;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Thanks for configuring your campaign. This proposal covers <strong style="color:#f0f0f4;">your single-campaign launch</strong> on branded domains we set up under your company. The full line-item breakdown is below.
      </p>

      ${buildCampaignSummaryCard({
        total: formattedTotal,
        month1ActualEmails: month1ActualEmails ?? 0,
        totalEmails,
        brandedSetupFee: brandedSetupFee ?? 0,
        inboxesNeeded: inboxesNeeded ?? 0,
        domainsNeeded: domainsNeeded ?? 0,
        monthlyRecurring: monthlyRecurringTotal,
        oneTime: oneTimeTotal,
      })}

      ${buildFullContract({
        campaignItems,
        setupItems,
        totalEmails,
        discountAmount,
        discountPercent,
        couponDiscountAmount,
        couponDiscountPercent,
        couponCode,
        total,
      })}

      ${buildTimelineCard(month1ActualEmails ?? 0)}

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
        <tr><td style="background:#0c0c14;border:1px solid rgba(177,19,15,0.25);border-radius:12px;padding:24px;">
          <p style="color:#f0f0f4;font-size:16px;font-weight:700;margin:0 0 6px;">Next Step: Book Your Onboarding Call</p>
          <p style="color:#8b8b9e;font-size:13px;margin:0 0 20px;line-height:1.6;">
            Schedule a quick call so we can review your configuration and launch your campaign.
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
    title: `New Order &mdash; ${companyDomain}`,
    preheader: `${fullName} (${companyDomain}) &mdash; ${formattedTotal}`,
    body: `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${buildDetailRow('Name', fullName)}
        ${buildDetailRow('Company', companyDomain)}
        ${buildDetailRow('Email', `<a href="mailto:${email}" style="color:#B1130F;text-decoration:none;">${email}</a>`)}
        ${buildDetailRow('Campaign Total', formattedTotal)}
        ${buildDetailRow('Capacity (emails/mo)', totalEmails.toLocaleString())}
        ${buildDetailRow('Sends This Campaign', (month1ActualEmails ?? 0).toLocaleString())}
        ${buildDetailRow('Branded Infra', `${inboxesNeeded ?? 0} inboxes / ${domainsNeeded ?? 0} domains`)}
        ${description ? buildDetailRow('Description', description) : ''}
      </table>

      ${buildFullContract({
        campaignItems,
        setupItems,
        totalEmails,
        discountAmount,
        discountPercent,
        couponDiscountAmount,
        couponDiscountPercent,
        couponCode,
        total,
      })}

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
        subject: `${companyDomain} — Your BleedAI Campaign Proposal`,
        html: clientHtml,
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        subject: `New Order — ${formattedTotal} — ${companyDomain} (${fullName})`,
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
  monthly: '',
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

interface SummaryCtx {
  total: string
  month1ActualEmails: number
  totalEmails: number
  brandedSetupFee: number
  inboxesNeeded: number
  domainsNeeded: number
  monthlyRecurring: number
  oneTime: number
}

function buildCampaignSummaryCard(ctx: SummaryCtx) {
  const bullets: string[] = [
    `Branded infrastructure built &amp; warmed (${ctx.inboxesNeeded} inboxes across ${ctx.domainsNeeded} domains)`,
    `<strong>${ctx.month1ActualEmails.toLocaleString()} sends</strong> during ramp phase &mdash; on ${ctx.totalEmails.toLocaleString()} total monthly capacity built`,
  ]
  if (ctx.brandedSetupFee > 0) {
    bullets.push(`${fmt(ctx.brandedSetupFee)} setup fee &mdash; one-time, included in this total`)
  }
  bullets.push('Full DFY lead sourcing, copy, reply handling, support &mdash; included')

  const split = (ctx.monthlyRecurring > 0 || ctx.oneTime > 0) ? `
    <div style="padding-top:10px;margin-top:10px;border-top:1px solid rgba(177,19,15,0.2);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#8b8b9e;font-size:11px;padding:3px 0;">Campaign costs (ramp-billed)</td>
          <td style="color:#f0f0f4;font-size:11px;font-weight:500;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;padding:3px 0;">${fmt(ctx.monthlyRecurring)}</td>
        </tr>
        ${ctx.oneTime > 0 ? `
        <tr>
          <td style="color:#8b8b9e;font-size:11px;padding:3px 0;">Setup fees</td>
          <td style="color:#f0f0f4;font-size:11px;font-weight:500;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;padding:3px 0;">${fmt(ctx.oneTime)}</td>
        </tr>` : ''}
      </table>
    </div>
  ` : ''

  const bulletsHtml = bullets
    .map((b) => `<tr><td style="padding:4px 0;color:#d2d2dc;font-size:12px;line-height:1.5;"><span style="color:#B1130F;">&#10003;</span>&nbsp;&nbsp;${b}</td></tr>`)
    .join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:rgba(177,19,15,0.08);border:1px solid rgba(177,19,15,0.35);border-radius:12px;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#B1130F;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Your Campaign</td>
              <td style="text-align:right;color:#5a5a6e;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;">One-time charge</td>
            </tr>
          </table>
          <div style="color:#f0f0f4;font-size:32px;font-weight:800;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;margin:10px 0 4px;">${ctx.total}</div>
          <div style="color:#8b8b9e;font-size:11px;margin-bottom:10px;">Covers everything &mdash; setup, lead data, copy, sends, reply handling, support.</div>
          ${split}
          <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:10px;margin-top:10px;border-top:1px solid rgba(177,19,15,0.2);">
            ${bulletsHtml}
          </table>
        </td>
      </tr>
    </table>
  `
}

interface ContractCtx {
  campaignItems: LineItem[]
  setupItems: LineItem[]
  totalEmails: number
  discountAmount: number
  discountPercent: number
  couponDiscountAmount: number
  couponDiscountPercent: number
  couponCode: string
  total: number
}

function buildFullContract(c: ContractCtx) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="padding:0 0 8px;color:#5a5a6e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;border-bottom:1px solid rgba(255,255,255,0.08);">Full Contract &mdash; Line-Item Breakdown</td>
      </tr>
    </table>

    ${buildLineItemSection('Campaign Costs', c.campaignItems, c.discountPercent)}
    ${buildLineItemSection('Setup Fees (one-time)', c.setupItems)}
    ${buildDiscounts(c.discountAmount, c.discountPercent, c.couponDiscountAmount, c.couponDiscountPercent, c.couponCode)}
    ${buildTotalBar(fmt(c.total), 'Campaign Total')}
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
        ${PERIOD_LABELS[item.period] ? `<span style="color:#3a3a4a;font-size:11px;font-weight:400;font-family:inherit;">${PERIOD_LABELS[item.period]}</span>` : ''}
      </td>
    </tr>
  `).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
      <tr>
        <td colspan="2" style="padding:14px 0 6px;color:#5a5a6e;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;">
          ${title}${discountNote}
        </td>
      </tr>
      ${rows}
    </table>
  `
}

function buildDiscounts(
  discountAmount: number,
  discountPercent: number,
  couponDiscountAmount: number,
  couponDiscountPercent: number,
  couponCode: string,
) {
  let html = ''

  if (discountAmount > 0) {
    html += `
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding:6px 0;color:#5a5a6e;font-size:13px;">Volume Discount (${discountPercent}% off)</td>
        <td style="padding:6px 0;color:#34d399;font-size:13px;font-weight:600;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;white-space:nowrap;">-${fmt(discountAmount)}</td>
      </tr></table>
    `
  }

  if (couponDiscountAmount > 0) {
    html += `
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding:6px 0;color:#5a5a6e;font-size:13px;">
          Coupon <span style="font-family:'SF Mono',SFMono-Regular,Menlo,monospace;background:#111119;padding:2px 8px;border-radius:4px;font-size:12px;color:#8b8b9e;">${couponCode}</span> (${couponDiscountPercent}% off)
        </td>
        <td style="padding:6px 0;color:#34d399;font-size:13px;font-weight:600;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;white-space:nowrap;">-${fmt(couponDiscountAmount)}</td>
      </tr></table>
    `
  }

  return html
}

function buildTotalBar(formattedTotal: string, label: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
      <tr><td colspan="2" style="height:2px;background:linear-gradient(to right,#B1130F,rgba(177,19,15,0.2));border-radius:1px;"></td></tr>
      <tr>
        <td style="padding:16px 0 0;color:#f0f0f4;font-size:15px;font-weight:600;">${label}</td>
        <td style="padding:16px 0 0;color:#f0f0f4;font-size:28px;font-weight:800;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;">${formattedTotal}</td>
      </tr>
    </table>
  `
}

function buildTimelineCard(month1ActualEmails: number) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr><td style="background:#0c0c14;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;">
        <div style="color:#5a5a6e;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">Campaign Timeline</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td width="90" style="color:#5a5a6e;font-size:12px;padding:3px 0;">Day 1</td><td style="color:#8b8b9e;font-size:12px;padding:3px 0;">Infrastructure setup</td></tr>
          <tr><td width="90" style="color:#5a5a6e;font-size:12px;padding:3px 0;">Days 2&ndash;15</td><td style="color:#8b8b9e;font-size:12px;padding:3px 0;">Provider warmup &mdash; zero sends</td></tr>
          <tr><td width="90" style="color:#B1130F;font-size:12px;font-weight:600;padding:3px 0;">Days 16&ndash;29</td><td style="color:#f0f0f4;font-size:12px;padding:3px 0;">Outbound ramp &mdash; <strong>${month1ActualEmails.toLocaleString()} emails sent</strong></td></tr>
        </table>
      </td></tr>
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
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#06060a;padding:32px 16px;">
        <tr><td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

            <tr>
              <td style="padding:0 0 32px;">
                <img src="https://calculator.bleedai.com/bleed-ai-logo.svg" alt="BleedAI" width="100" style="display:block;height:auto;" />
              </td>
            </tr>

            <tr>
              <td style="padding:0 0 8px;">
                <h1 style="color:#f0f0f4;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.02em;">${title}</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:0 0 28px;">
                <div style="height:2px;background:linear-gradient(to right,#B1130F,transparent 60%);border-radius:1px;"></div>
              </td>
            </tr>

            <tr>
              <td style="background:#0c0c14;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:1px;">
                <div style="background:#111119;border-radius:15px;padding:28px 24px;">
                  ${body}
                </div>
              </td>
            </tr>

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
