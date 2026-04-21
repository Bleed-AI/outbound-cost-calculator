import { calculateTotal, DEFAULT_STATE } from '../src/lib/pricing'
import type { MonthType } from '../src/lib/types'

const RECIPIENTS = ['ahat2018@gmail.com', 'bleedaisubscriptions@gmail.com']

const runTag = new Date().toTimeString().slice(0, 5).replace(':', '')

function buildPayload(monthType: MonthType, email: string, scenarioLabel: string) {
  const state = {
    ...DEFAULT_STATE,
    monthType,
    inboxOwnership: 'user_domains' as const,
    leadsPerMonth: 7500,
    emailsPerProspect: 2,
    dataSource: 'dfy_scrape' as const,
    enrichments: 'standard' as const,
    copywriting: 'full_strategy' as const,
    campaigns: 2 as const,
    replyHandling: 'ai_instantly' as const,
    support: 'slack_light' as const,
    addOns: { ...DEFAULT_STATE.addOns, linkedin: true, landingPage: true },
    coupon: 'NEW5',
    upworkFee: true,
  }

  const result = calculateTotal(state)
  const month2 = calculateTotal({ ...state, monthType: 'normal_month' })

  return {
    firstName: 'Ahat',
    lastName: 'Test',
    companyDomain: `acme-${monthType === 'first_month' ? 'pilot' : 'monthly'}-${runTag}.com`,
    email,
    description: `Test: ${scenarioLabel}`,
    total: result.total,
    lineItems: result.lineItems,
    discountAmount: result.discountAmount,
    discountPercent: result.discountPercent,
    couponDiscountAmount: result.couponDiscountAmount,
    couponDiscountPercent: result.couponDiscountPercent,
    couponCode: state.coupon,
    upworkFeeAmount: result.upworkFeeAmount,
    totalEmails: result.totalEmails,
    monthlyRecurringTotal: result.monthlyRecurringTotal,
    oneTimeTotal: result.oneTimeTotal,
    month2MonthlyRecurring: month2.monthlyRecurringTotal,
    isFirstMonthBranded: result.isFirstMonthBranded ?? false,
    month1ActualEmails: result.month1ActualEmails ?? 0,
    brandedSetupFee: result.brandedSetupFee ?? 0,
    inboxesNeeded: result.inboxesNeeded ?? 0,
    domainsNeeded: result.domainsNeeded ?? 0,
    shareUrl: 'https://calculator.bleedai.com/?l=7500&e=2&i=user_domains&d=dfy_scrape&en=standard&c=full_strategy&ca=2&r=ai_instantly&su=slack_light&li=1&lp=1&cp=NEW5&uw=1',
  }
}

async function send(payload: ReturnType<typeof buildPayload>) {
  const res = await fetch('http://localhost:3000/api/send-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  console.log(`→ ${payload.email} [${payload.description}] status=${res.status}`, body)
}

async function main() {
  const scenarios: Array<{ monthType: MonthType; label: string }> = [
    { monthType: 'first_month', label: 'Pilot Month (branded, first month)' },
    { monthType: 'normal_month', label: 'Normal Month (month 2+)' },
  ]

  for (const scenario of scenarios) {
    for (const email of RECIPIENTS) {
      const payload = buildPayload(scenario.monthType, email, scenario.label)
      await send(payload)
    }
  }

  // Print line item periods for the pilot scenario so we can verify.
  const pilot = buildPayload('first_month', RECIPIENTS[0], 'audit')
  console.log('\nPilot scenario line items:')
  for (const i of pilot.lineItems) {
    console.log(`  [${i.period}] ${i.label} — $${i.amount}`)
  }
  const normal = buildPayload('normal_month', RECIPIENTS[0], 'audit')
  console.log('\nNormal month line items:')
  for (const i of normal.lineItems) {
    console.log(`  [${i.period}] ${i.label} — $${i.amount}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
