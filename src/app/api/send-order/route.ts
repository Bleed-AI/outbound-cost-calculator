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
  monthlyRecurringTotal: number
  oneTimeTotal: number
  month2MonthlyRecurring: number
  isFirstMonthBranded: boolean
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
    upworkFeeAmount,
    totalEmails,
    monthlyRecurringTotal,
    oneTimeTotal,
    month2MonthlyRecurring,
    isFirstMonthBranded,
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
  const formattedPilot = fmt(total)
  const formattedMonth2 = fmt(month2MonthlyRecurring)

  const monthlyItems = lineItems.filter((i) => i.period === 'monthly')
  const oneTimeItems = lineItems.filter((i) => i.period === 'one-time')
  const monthlySubtotal = monthlyItems.reduce((s, i) => s + i.amount, 0)
  const oneTimeSubtotal = oneTimeItems.reduce((s, i) => s + i.amount, 0)

  // Emails actually sent in the billed month vs the full monthly capacity
  // we're building. On a pilot-branded month the ramp phase sends fewer
  // than the capacity target; on a normal month the two are equal.
  const emailsThisMonth = isFirstMonthBranded ? month1ActualEmails : totalEmails
  const monthlyCapacity = totalEmails

  const pilotContext = {
    pilotTotal: formattedPilot,
    month2Recurring: formattedMonth2,
    isFirstMonthBranded,
    month1ActualEmails,
    totalEmails,
    brandedSetupFee,
    inboxesNeeded,
    domainsNeeded,
    monthlyInPilot: monthlyRecurringTotal,
    oneTimeInPilot: oneTimeTotal,
  }

  const scenarioIntro = isFirstMonthBranded
    ? `This is your <strong style="color:#f0f0f4;">pilot month</strong> proposal &mdash; we spend the first two weeks warming ${inboxesNeeded} inboxes across ${domainsNeeded} domains, then ramp to ${(emailsThisMonth ?? 0).toLocaleString()} sends in the back half of the month. From <strong style="color:#f0f0f4;">Month 2 onward</strong> you run at the full ${monthlyCapacity.toLocaleString()} emails / month, every month.`
    : `This is your <strong style="color:#f0f0f4;">month-to-month</strong> proposal &mdash; running at full capacity with <strong style="color:#f0f0f4;">${monthlyCapacity.toLocaleString()} emails / month</strong> from day one.`

  const clientHtml = buildEmail({
    title: `${companyDomain} &mdash; BleedAI Campaign Proposal`,
    preheader: isFirstMonthBranded
      ? `Pilot: ${formattedPilot} · Month 2+: ${formattedMonth2}/mo`
      : `${formattedMonth2}/mo · ${monthlyCapacity.toLocaleString()} emails / month`,
    body: `
      <p style="color:#d2d2dc;font-size:15px;line-height:1.7;margin:0 0 12px;">
        Hi ${firstName},
      </p>
      <p style="color:#8b8b9e;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Thanks for configuring your campaign. ${scenarioIntro} The full line-item contract is below.
      </p>

      ${isFirstMonthBranded
        ? buildCapacityCard(emailsThisMonth, monthlyCapacity, true, inboxesNeeded, domainsNeeded)
        : ''}

      ${isFirstMonthBranded ? buildPilotMonth2Cards(pilotContext) : ''}

      ${buildFullContract({
        monthlyItems,
        oneTimeItems,
        monthlySubtotal,
        oneTimeSubtotal,
        totalEmails,
        discountAmount,
        discountPercent,
        couponDiscountAmount,
        couponDiscountPercent,
        couponCode,
        upworkFeeAmount,
        total,
        isFirstMonthBranded,
      })}

      ${buildTimelineCard(isFirstMonthBranded, month1ActualEmails)}

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
        <tr><td style="background:#0c0c14;border:1px solid rgba(177,19,15,0.25);border-radius:12px;padding:24px;">
          <p style="color:#f0f0f4;font-size:16px;font-weight:700;margin:0 0 6px;">Next Step: Book Your Onboarding Call</p>
          <p style="color:#8b8b9e;font-size:13px;margin:0 0 20px;line-height:1.6;">
            Schedule a quick call so we can review your configuration and launch your pilot.
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
    preheader: `${fullName} (${companyDomain}) &mdash; ${isFirstMonthBranded ? `Pilot ${formattedPilot} · Month 2+ ${formattedMonth2}/mo` : `${formattedPilot}`}`,
    body: `
      <!-- Client details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${buildDetailRow('Name', fullName)}
        ${buildDetailRow('Company', companyDomain)}
        ${buildDetailRow('Email', `<a href="mailto:${email}" style="color:#B1130F;text-decoration:none;">${email}</a>`)}
        ${buildDetailRow('Scenario', isFirstMonthBranded ? 'Pilot Month (branded, first month)' : 'Month-to-Month (normal month)')}
        ${buildDetailRow('Emails / month (capacity)', totalEmails.toLocaleString())}
        ${isFirstMonthBranded ? buildDetailRow('Emails this pilot month', (emailsThisMonth ?? 0).toLocaleString()) : ''}
        ${isFirstMonthBranded ? buildDetailRow('Pilot total', formattedPilot) : ''}
        ${buildDetailRow(isFirstMonthBranded ? 'Month 2+ recurring' : 'Monthly total', `${formattedMonth2}/mo`)}
        ${description ? buildDetailRow('Description', description) : ''}
      </table>

      ${buildFullContract({
        monthlyItems,
        oneTimeItems,
        monthlySubtotal,
        oneTimeSubtotal,
        totalEmails,
        discountAmount,
        discountPercent,
        couponDiscountAmount,
        couponDiscountPercent,
        couponCode,
        upworkFeeAmount,
        total,
        isFirstMonthBranded,
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
        subject: `${companyDomain} — BleedAI Campaign Proposal`,
        html: clientHtml,
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        subject: `New Order — ${formattedPilot} — ${companyDomain} (${fullName})`,
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

interface PilotContext {
  pilotTotal: string
  month2Recurring: string
  isFirstMonthBranded: boolean
  month1ActualEmails: number
  totalEmails: number
  brandedSetupFee: number
  inboxesNeeded: number
  domainsNeeded: number
  monthlyInPilot: number
  oneTimeInPilot: number
}

function buildPilotMonth2Cards(ctx: PilotContext) {
  const pilotBullets: string[] = []
  if (ctx.isFirstMonthBranded) {
    pilotBullets.push('Infrastructure built &amp; warmed (14 days)')
    pilotBullets.push(`<strong>${ctx.month1ActualEmails.toLocaleString()} ramp-phase sends</strong> &mdash; billed on these, not the ${ctx.totalEmails.toLocaleString()} target`)
    if (ctx.brandedSetupFee > 0) {
      pilotBullets.push(`${fmt(ctx.brandedSetupFee)} setup fee included`)
    }
    pilotBullets.push('One-time add-ons paid now, never again')
  } else {
    pilotBullets.push(`<strong>${ctx.totalEmails.toLocaleString()} emails</strong> sent this month`)
    pilotBullets.push('All selected add-ons &amp; support active')
    pilotBullets.push('One-time add-ons paid now, never again')
  }

  const month2Bullets = [
    `<strong>${ctx.totalEmails.toLocaleString()} emails / month</strong> (full target)`,
    'Full branded sending from day 1',
    'All selected add-ons &amp; support continue',
    'No setup fees after pilot',
  ]

  const split = (ctx.monthlyInPilot > 0 || ctx.oneTimeInPilot > 0) ? `
    <div style="padding-top:10px;margin-top:10px;border-top:1px solid rgba(177,19,15,0.2);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#8b8b9e;font-size:11px;padding:3px 0;">Monthly costs (ramp-billed)</td>
          <td style="color:#f0f0f4;font-size:11px;font-weight:500;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;padding:3px 0;">${fmt(ctx.monthlyInPilot)}</td>
        </tr>
        ${ctx.oneTimeInPilot > 0 ? `
        <tr>
          <td style="color:#8b8b9e;font-size:11px;padding:3px 0;">One-time fees</td>
          <td style="color:#f0f0f4;font-size:11px;font-weight:500;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;padding:3px 0;">${fmt(ctx.oneTimeInPilot)}</td>
        </tr>` : ''}
      </table>
    </div>
  ` : ''

  const pilotBulletsHtml = pilotBullets
    .map((b) => `<tr><td style="padding:4px 0;color:#d2d2dc;font-size:12px;line-height:1.5;"><span style="color:#B1130F;">&#10003;</span>&nbsp;&nbsp;${b}</td></tr>`)
    .join('')
  const month2BulletsHtml = month2Bullets
    .map((b) => `<tr><td style="padding:4px 0;color:#d2d2dc;font-size:12px;line-height:1.5;"><span style="color:#8b8b9e;">&#10003;</span>&nbsp;&nbsp;${b}</td></tr>`)
    .join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <!-- Pilot card -->
        <td width="49%" valign="top" style="background:rgba(177,19,15,0.08);border:1px solid rgba(177,19,15,0.35);border-radius:12px;padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#B1130F;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Pilot Month</td>
              <td style="text-align:right;color:#5a5a6e;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;">One-time</td>
            </tr>
          </table>
          <div style="color:#f0f0f4;font-size:26px;font-weight:800;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;margin:10px 0 4px;">${ctx.pilotTotal}</div>
          <div style="color:#8b8b9e;font-size:11px;margin-bottom:10px;"><span style="color:#f0f0f4;">&rarr; BleedAI</span> &middot; billed once for pilot month</div>
          ${split}
          <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:10px;margin-top:10px;border-top:1px solid rgba(177,19,15,0.2);">
            ${pilotBulletsHtml}
          </table>
        </td>
        <td width="2%">&nbsp;</td>
        <!-- Month 2+ card -->
        <td width="49%" valign="top" style="background:#0c0c14;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#8b8b9e;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Month 2 Onwards</td>
              <td style="text-align:right;color:#5a5a6e;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;">Recurring</td>
            </tr>
          </table>
          <div style="color:#f0f0f4;font-size:26px;font-weight:800;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;margin:10px 0 4px;">${ctx.month2Recurring}<span style="font-size:14px;color:#5a5a6e;font-weight:500;">/mo</span></div>
          <div style="color:#8b8b9e;font-size:11px;margin-bottom:10px;"><span style="color:#f0f0f4;">&rarr; BleedAI</span> &middot; recurring, every month</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:10px;margin-top:10px;border-top:1px solid rgba(255,255,255,0.08);">
            ${month2BulletsHtml}
          </table>
        </td>
      </tr>
    </table>
  `
}

interface ContractCtx {
  monthlyItems: LineItem[]
  oneTimeItems: LineItem[]
  monthlySubtotal: number
  oneTimeSubtotal: number
  totalEmails: number
  discountAmount: number
  discountPercent: number
  couponDiscountAmount: number
  couponDiscountPercent: number
  couponCode: string
  upworkFeeAmount: number
  total: number
  isFirstMonthBranded: boolean
}

function buildFullContract(c: ContractCtx) {
  const totalLabel = c.isFirstMonthBranded ? 'Pilot Month Total' : 'This Month Total'
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="padding:0 0 8px;color:#5a5a6e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;border-bottom:1px solid rgba(255,255,255,0.08);">Full Contract &mdash; Line-Item Breakdown</td>
      </tr>
    </table>

    ${buildLineItemSection('Monthly / Recurring', c.monthlyItems, c.discountPercent)}
    ${buildLineItemSection('One-Time Costs', c.oneTimeItems)}
    ${buildSubtotals(c.monthlySubtotal, c.oneTimeSubtotal, c.totalEmails)}
    ${buildDiscounts(c.discountAmount, c.discountPercent, c.couponDiscountAmount, c.couponDiscountPercent, c.couponCode, c.upworkFeeAmount)}
    ${buildTotalBar(fmt(c.total), totalLabel)}
  `
}

function buildCapacityCard(
  emailsThisMonth: number | undefined,
  monthlyCapacity: number,
  isFirstMonthBranded: boolean,
  inboxesNeeded: number,
  domainsNeeded: number,
) {
  const thisMonth = (emailsThisMonth ?? monthlyCapacity).toLocaleString()
  const capacity = monthlyCapacity.toLocaleString()
  const sameNumber = !isFirstMonthBranded
  const subline = isFirstMonthBranded
    ? `Pilot month ramps gradually while the ${inboxesNeeded} inboxes across ${domainsNeeded} domains warm up. From Month 2 onward you send at full capacity.`
    : `Running at full capacity every day this month.`

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td width="49%" valign="top" style="background:#0c0c14;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-align:center;">
          <div style="color:#5a5a6e;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Emails This Month</div>
          <div style="color:#f0f0f4;font-size:28px;font-weight:800;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;">${thisMonth}</div>
          <div style="color:#8b8b9e;font-size:11px;margin-top:4px;">${sameNumber ? 'full monthly volume' : 'ramp-phase sends'}</div>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="49%" valign="top" style="background:rgba(177,19,15,0.06);border:1px solid rgba(177,19,15,0.25);border-radius:12px;padding:16px;text-align:center;">
          <div style="color:#B1130F;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Monthly Capacity Built</div>
          <div style="color:#f0f0f4;font-size:28px;font-weight:800;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em;">${capacity}</div>
          <div style="color:#8b8b9e;font-size:11px;margin-top:4px;">emails / month, recurring</div>
        </td>
      </tr>
      <tr>
        <td colspan="3" style="padding-top:10px;">
          <div style="color:#8b8b9e;font-size:12px;line-height:1.6;text-align:center;">${subline}</div>
        </td>
      </tr>
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
        <td colspan="2" style="padding:14px 0 6px;color:#5a5a6e;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;">
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

  if (upworkFeeAmount > 0) {
    html += `
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding:6px 0;color:#5a5a6e;font-size:13px;">Upwork platform fee (+10%)</td>
        <td style="padding:6px 0;color:#8b8b9e;font-size:13px;font-weight:600;text-align:right;font-family:'SF Mono',SFMono-Regular,Menlo,monospace;white-space:nowrap;">+${fmt(upworkFeeAmount)}</td>
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

function buildTimelineCard(isFirstMonthBranded: boolean, month1ActualEmails: number) {
  if (!isFirstMonthBranded) return ''
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr><td style="background:#0c0c14;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;">
        <div style="color:#5a5a6e;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">Pilot Month Timeline</div>
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
