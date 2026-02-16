/**
 * 共用：Party DJ 計畫生成邏輯，供 /api/party-dj/plan 與 /api/v1/party-dj/plan 使用
 */
import Groq from 'groq-sdk'
import { z } from 'zod'
import { groq } from '@/lib/groq'
import { GROQ_PARTY_DJ_API_KEY, CHAT_TIMEOUT_MS } from '@/lib/env-config'
import { logger } from '@/lib/logger'

const partyDjClient = GROQ_PARTY_DJ_API_KEY
  ? new Groq({ apiKey: GROQ_PARTY_DJ_API_KEY, timeout: CHAT_TIMEOUT_MS })
  : groq

export const PartyPlanSchema = z.object({
  peopleCount: z.number().min(2).max(50).default(6),
  durationMin: z.number().min(15).max(300).default(30),
  mood: z.enum(['relaxed', 'intense', 'mixed']).default('mixed'),
  allow18: z.boolean().default(false),
  useAiTransition: z.boolean().optional(),
  subscriptionTier: z.string().optional(),
})

export type PartyPlanInput = z.infer<typeof PartyPlanSchema>

export interface GeneratePartyPlanResult {
  plan: { phases?: unknown[]; totalMin?: number;[k: string]: unknown }
  peopleCount: number
  durationMin: number
  /** Phase 1 Task 15：免費方案浮水印 */
  showWatermark: boolean
  /** Phase 1 Task 17：免費方案禁止下載 PDF */
  canDownloadPdf: boolean
}

/**
 * 解析 body、套用免費方案上限、呼叫 Groq 生成計畫並解析 JSON。
 * @throws {z.ZodError} 參數驗證失敗
 * @throws {Error} AI 回應非合法 JSON 時
 */
export async function generatePartyPlan(body: unknown): Promise<GeneratePartyPlanResult> {
  const parsed = PartyPlanSchema.parse(body)
  let { peopleCount, durationMin, mood, allow18, useAiTransition, subscriptionTier } = parsed

  const isFree = !subscriptionTier || subscriptionTier === 'free'

  if (isFree) {
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

  const completion = await partyDjClient.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }],
    model: 'llama3-70b-8192',
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const rawContent = completion.choices[0]?.message?.content || '{}'
  let plan: { phases?: unknown[]; totalMin?: number;[k: string]: unknown }
  try {
    plan = JSON.parse(rawContent) as typeof plan
  } catch (e) {
    logger.error('Party DJ JSON parse failed', { raw: String(rawContent).slice(0, 500) })
    throw new Error('Invalid JSON response from AI')
  }

  return {
    plan,
    peopleCount,
    durationMin,
    showWatermark: isFree,
    canDownloadPdf: !isFree,
  }
}
