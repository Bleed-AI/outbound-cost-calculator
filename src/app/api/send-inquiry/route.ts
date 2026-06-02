import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const OWNER_EMAIL = 'owner@bleedai.com'
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'BleedAI <onboarding@resend.dev>'
const BOOK_CALL_URL = 'https://bleedai.com/book-call/'

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

type InquiryKind = 'package' | 'trial'

interface InquiryPayload {
  kind: InquiryKind
  tierLabel: string
  priceLabel?: string
  metadata?: Record<string, string | number | boolean>
  firstName: string
  lastName: string
  companyDomain: string
  email: string
  description?: string
}

export async function POST(req: NextRequest) {
  let payload: InquiryPayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    kind,
    tierLabel,
    priceLabel,
    metadata,
    firstName,
    lastName,
    companyDomain,
    email,
    description,
  } = payload

  if (!kind || !['package', 'trial'].includes(kind)) {
    return NextResponse.json({ error: 'Invalid inquiry kind' }, { status: 400 })
  }
  if (!firstName || !lastName || !companyDomain || !email || !tierLabel) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const fullName = `${firstName} ${lastName}`
  const kindLabel = kind === 'package' ? 'Managed Outbound Package' : 'Trial Campaign'
  const subjectPrefix = kind === 'package' ? 'Package Order' : 'Trial Order'

  const ctaCopy = kind === 'trial'
    ? 'Pick a kickoff time below — we usually launch the same day or next.'
    : 'Pick a time below so we can kick off your monthly outbound.'
  const introCopy = kind === 'trial'
    ? `Thanks for placing your trial order for <strong style="color:#f0f0f4;">${tierLabel}</strong>${priceLabel ? ` (${priceLabel})` : ''}. We&rsquo;ll align on ICPs and offer on the kickoff call, then launch experiments same day on our pre-warmed accounts.`
    : `Thanks for getting started with <strong style="color:#f0f0f4;">${tierLabel}</strong>${priceLabel ? ` (${priceLabel})` : ''}. We&rsquo;ll use the kickoff call to align on goals and then start running monthly outbound for you.`

  const clientHtml = buildEmail({
    title: `Your ${kindLabel} Order — Next Steps`,
    preheader: `${tierLabel}${priceLabel ? ` · ${priceLabel}` : ''} · ${ctaCopy}`,
    body: `
      <p style="color:#d2d2dc;font-size:15px;line-height:1.7;margin:0 0 12px;">
        Hi ${firstName},
      </p>
      <p style="color:#8b8b9e;font-size:14px;line-height:1.7;margin:0 0 24px;">
        ${introCopy}
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${buildDetailRow('Selected', tierLabel)}
        ${priceLabel ? buildDetailRow('Reference price', priceLabel) : ''}
        ${buildDetailRow('Company', companyDomain)}
        ${description ? buildDetailRow('What you said', description) : ''}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
        <tr><td style="background:#0c0c14;border:1px solid rgba(177,19,15,0.25);border-radius:12px;padding:24px;">
          <p style="color:#f0f0f4;font-size:16px;font-weight:700;margin:0 0 6px;">${kind === 'trial' ? 'Pick a Kickoff Time' : 'Pick a Time to Kick Off'}</p>
          <p style="color:#8b8b9e;font-size:13px;margin:0 0 20px;line-height:1.6;">
            ${ctaCopy}
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#B1130F;border-radius:8px;">
            <a href="${BOOK_CALL_URL}" style="display:inline-block;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;text-decoration:none;letter-spacing:0.02em;">
              ${kind === 'trial' ? 'Schedule Kickoff &rarr;' : 'Schedule Kickoff Call &rarr;'}
            </a>
          </td></tr></table>
        </td></tr>
      </table>
    `,
  })

  const ownerHtml = buildEmail({
    title: `${subjectPrefix} &mdash; ${companyDomain}`,
    preheader: `${fullName} (${companyDomain}) &mdash; ${tierLabel}${priceLabel ? ` · ${priceLabel}` : ''}`,
    body: `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        ${buildDetailRow('Inquiry type', kindLabel)}
        ${buildDetailRow('Selected', tierLabel)}
        ${priceLabel ? buildDetailRow('Reference price', priceLabel) : ''}
        ${buildDetailRow('Name', fullName)}
        ${buildDetailRow('Company', companyDomain)}
        ${buildDetailRow('Email', `<a href="mailto:${email}" style="color:#B1130F;text-decoration:none;">${email}</a>`)}
        ${description ? buildDetailRow('Description', description) : ''}
        ${metadata && Object.keys(metadata).length > 0 ? buildDetailRow('Metadata', `<code style="font-family:'SF Mono',SFMono-Regular,Menlo,monospace;font-size:11px;color:#8b8b9e;">${escapeHtml(JSON.stringify(metadata))}</code>`) : ''}
      </table>

      <p style="color:#8b8b9e;font-size:13px;line-height:1.6;margin:0;">
        Client will land on <a href="${BOOK_CALL_URL}" style="color:#B1130F;">${BOOK_CALL_URL}</a> to book.
      </p>
    `,
  })

  try {
    await Promise.all([
      getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your ${kindLabel} Order — ${tierLabel}`,
        html: clientHtml,
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        subject: `${subjectPrefix} — ${tierLabel} — ${companyDomain} (${fullName})`,
        html: ownerHtml,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}

/* ── Helpers ─────────────────────────────────────────────── */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildDetailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;color:#5a5a6e;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#f0f0f4;font-size:13px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">${value}</td>
    </tr>
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
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

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
