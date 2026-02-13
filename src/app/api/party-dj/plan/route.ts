import { NextResponse } from 'next/server'
import { z } from 'zod'
import { groq } from '@/lib/groq'
import { logger } from '@/lib/logger'

// Schema for request validation
const PartyPlanSchema = z.object({
  peopleCount: z.number().min(2).max(50).default(6),
  durationMin: z.number().min(15).max(300).default(30),
  mood: z.enum(['relaxed', 'intense', 'mixed']).default('mixed'),
  allow18: z.boolean().default(false),
  useAiTransition: z.boolean().optional(),
  subscriptionTier: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { peopleCount, durationMin, mood, allow18, useAiTransition, subscriptionTier } = PartyPlanSchema.parse(body)

    // Enforce Free Tier Limits (R2-005 logic from requirement)
    // If subscriptionTier is missing or 'free', cap duration at 30 min
    if (!subscriptionTier || subscriptionTier === 'free') {
      durationMin = Math.min(durationMin, 30)
    }

    const systemPrompt = `You are a professional Party DJ and Game Master. 
    Your goal is to curate a perfect sequence of party games for a specific group.
    
    Context:
    - People: ${peopleCount}
    - Duration: ${durationMin} minutes
    - Mood: ${mood}
    - 18+ Allowed: ${allow18 ? 'Yes' : 'No'}
    - Subscription: ${subscriptionTier || 'free'}
    
    Available Games Database (Abstract):
    - "Never Have I Ever" (all vibes, good for icebreaker)
    - "Truth or Dare" (wild/flirty${allow18 ? ', 18+ mode available' : ''})
    - "King's Cup" (heavy alcohol, classic, 18+)
    - "Trivia" (competitive, chill)
    - "Most Likely To" (icebreaker, wild)
    - "Charades" (competitive, chill)
    - "Russian Roulette" (suspense)
    - "Dice" (simple, utility)
    
    Output strictly in JSON format with this structure:
    {
      "phases": [
		{
		  "phase": "Game Phase (e.g. Warm Up, Peak, Cool Down)",
		  "durationMin": number,
		  "gameIds": ["string (e.g. 'trivia', 'roulette', 'truth-or-dare', 'most-likely-to', 'dice', 'kings-cup')"],
		  "transitionText": "Sassy transition message for the host to read${useAiTransition ? ' (Use creative AI persona)' : ''}"
		}
	  ],
      "totalMin": number
    }
    
    Ensure the total duration matches closely. Start with icebreakers, peak in the middle, and wind down or go wild at the end depending on mood.
    If 18+ is NOT allowed, do not suggest drinking games like King's Cup or overly sexual themes.
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: 'llama3-70b-8192',
      temperature: 0.7, // Creativity
      response_format: { type: 'json_object' },
    })

    const rawContent = completion.choices[0]?.message?.content || '{}'
    let plan: { phases?: unknown[]; totalMin?: number; [k: string]: unknown }
    try {
      plan = JSON.parse(rawContent) as typeof plan
    } catch (e) {
      logger.error('Party DJ JSON parse failed', { raw: String(rawContent).slice(0, 500) })
      throw new Error('Invalid JSON response from AI')
    }

    // 合併 peopleCount 與 tier-capped totalMin 到回應（測試與前端依賴）
    return NextResponse.json({
      ...plan,
      peopleCount,
      totalMin: durationMin,
    })
  } catch (error) {
    logger.error('Party DJ Error', { err: error instanceof Error ? error.message : String(error) })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Failed to generate plan' }, { status: 500 })
  }
}
