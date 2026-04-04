import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

// Lazily initialized so build doesn't fail without the key
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OpenAI
    if (!key) throw new Error('OpenAI environment variable is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

const SYSTEM_PROMPT = `You are a cold email campaign performance analyst specializing in B2B outbound. Given a company's domain, research what they do and estimate REALISTIC cold outreach metrics.

CRITICAL CONTEXT — COLD EMAIL METRICS (Instantly.ai definitions):

1. **Reply Rate**: % of emails receiving ANY reply (positive, negative, neutral, OOO). Typical REALISTIC range: 1–5%.
2. **Positive Reply Rate**: % of REPLIES that express genuine interest. This is a percentage OF replies, NOT of total emails. Typical REALISTIC range: 15–40%.

CALIBRATION — ERR ON THE CONSERVATIVE SIDE:
- Cold email is increasingly competitive. Inboxes are saturated. Most campaigns start with LOWER rates and optimize over time.
- For a FIRST campaign with no prior optimization: use the LOWER end of benchmarks.
- A 2-4% reply rate is realistic for most B2B verticals. Above 5% is exceptional and rare for cold outreach.
- A positive reply rate of 20-35% of replies is typical. Above 40% is unusual.
- The EFFECTIVE positive reply rate (replies × positive %) for most cold campaigns lands between 0.3% and 1.5% of total emails sent. If your math yields higher than 2%, you are likely too optimistic.

DECOMPOSING COMBINED RATES:
Many sources combine reply rate and positive reply rate into one number. When a source says "1% response rate," it means ~3% reply rate × ~33% positive rate = ~1% effective. Always decompose.

RESEARCH STEPS:
1. Look up the company's website: what they sell, target market (SMB/mid-market/enterprise), price tier
2. Search for cold email benchmarks for their specific vertical and offer type
3. Consider: market saturation, novelty of offer, target persona seniority, price point
4. Agencies, SaaS, and staffing are SATURATED — use lower-end estimates
5. Technical/niche B2B services with clear ROI tend to perform better

IMPORTANT: These estimates are for a FIRST cold outreach campaign with no prior optimization. Real results depend on list quality, copy, offer, and targeting. Make this clear in your reasoning.`

const RESPONSE_SCHEMA = {
  type: 'json_schema' as const,
  name: 'roi_estimate',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      companyDescription: {
        type: 'string',
        description: 'One sentence: what the company does and who they serve',
      },
      replyRate: {
        type: 'number',
        description: 'Estimated reply rate as a percentage (e.g. 2.5 means 2.5%). Conservative estimate for a first campaign.',
      },
      positiveReplyRate: {
        type: 'number',
        description: 'Estimated positive reply rate as a percentage OF replies (e.g. 25 means 25% of replies are positive). Conservative estimate.',
      },
      reasoning: {
        type: 'string',
        description: '2-4 sentences: what benchmarks you found, factors that influenced estimates, and caveats about first-campaign expectations.',
      },
    },
    required: ['companyDescription', 'replyRate', 'positiveReplyRate', 'reasoning'],
    additionalProperties: false,
  },
}

async function callOpenAI(openai: OpenAI, domain: string): Promise<{
  companyDescription: string
  replyRate: number
  positiveReplyRate: number
  reasoning: string
}> {
  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    tools: [{ type: 'web_search_preview' as const }],
    instructions: SYSTEM_PROMPT,
    input: `Research this company and estimate cold email outreach performance metrics for a first campaign: ${domain}`,
    text: { format: RESPONSE_SCHEMA },
  })

  const text = response.output_text

  // Structured output should be clean JSON, but handle edge cases
  const jsonStr = text
    .replace(/```json?\n?/g, '')
    .replace(/```/g, '')
    .trim()

  const parsed = JSON.parse(jsonStr)

  // Clamp to realistic ranges
  const replyRate = Math.max(0.5, Math.min(8, Number(parsed.replyRate) || 2.5))
  const positiveReplyRate = Math.max(10, Math.min(55, Number(parsed.positiveReplyRate) || 25))

  return {
    companyDescription: String(parsed.companyDescription || ''),
    replyRate: Math.round(replyRate * 10) / 10,
    positiveReplyRate: Math.round(positiveReplyRate * 10) / 10,
    reasoning: String(parsed.reasoning || ''),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    const openai = getOpenAI()

    // Try up to 2 times if parsing fails
    let lastError = ''
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await callOpenAI(openai, cleanDomain)
        return NextResponse.json(result)
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Parse error'
        // Only retry on parse errors, not API errors
        if (lastError.includes('JSON') || lastError.includes('parse')) continue
        break
      }
    }

    return NextResponse.json(
      { error: `Research failed: ${lastError}` },
      { status: 500 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
