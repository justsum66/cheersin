/**
 * P2-389：AI 派對策劃師 — 編排引擎 API
 * POST /api/party-dj/plan：輸入人數、時長、是否含 18+，回傳階段與遊戲列表
 * 殺手 #28：可選 useAiTransition，以 LLM 為每個 phase 生成一句過渡語
 * R2-019：使用 handleApiError + validationError 統一錯誤處理與 400 校驗
 */
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { gamesWithCategory } from '@/config/games.config'
import { GROQ_API_KEY } from '@/lib/env-config'
import { handleApiError, validationError } from '@/lib/api-error'

const PHASE_NAMES = ['暖場', '升溫', '高潮', '收尾'] as const
const TRANSITIONS: Record<string, string> = {
  暖場: '先來點輕鬆的，大家暖個身！',
  升溫: '氣氛起來了，接下來更刺激一點！',
  高潮: '派對最嗨的環節來了！',
  收尾: '最後收尾，大家乾一杯！',
}

/** #28：若啟用且 API key 存在，用 LLM 生成四句過渡語；失敗則用固定文案 */
async function generateTransitionTexts(): Promise<Record<string, string>> {
  if (!GROQ_API_KEY) return TRANSITIONS
  const groq = new Groq({ apiKey: GROQ_API_KEY })
  const prompt = `你是一個派對主持人。請為以下四個派對階段各生成「一句」繁體中文過渡語（每句 15 字以內、輕鬆有趣）：
1. 暖場
2. 升溫
3. 高潮
4. 收尾
僅回傳四行文字，每行一句，不要編號、不要其他說明。`
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    })
    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const lines = raw.split('\n').map((s) => s.replace(/^\d+[.．]\s*/, '').trim()).filter(Boolean)
    if (lines.length >= 4) {
      return {
        暖場: lines[0] || TRANSITIONS['暖場'],
        升溫: lines[1] || TRANSITIONS['升溫'],
        高潮: lines[2] || TRANSITIONS['高潮'],
        收尾: lines[3] || TRANSITIONS['收尾'],
      }
    }
  } catch {
    /* fallback to TRANSITIONS */
  }
  return TRANSITIONS
}

/** 依人數與分類篩選遊戲 ID（簡單規則：party/reaction 適合多人；adult 需 allow18） */
function pickGameIds(
  peopleCount: number,
  allow18: boolean,
  category: 'party' | 'reaction' | 'adult' | 'other',
  limit: number
): string[] {
  const list = gamesWithCategory.filter((g) => {
    if (category === 'adult' && !allow18) return false
    if (g.category !== category) return false
    const mins = g.estimatedMinutes ?? 10
    return mins >= 3 && mins <= 25
  })
  const shuffled = [...list].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit).map((g) => g.id)
}

/** 分配各階段時長（分鐘）：暖場 20%、升溫 30%、高潮 40%、收尾 10% */
function allocateDurations(totalMin: number): number[] {
  const warm = Math.max(5, Math.round(totalMin * 0.2))
  const ramp = Math.max(5, Math.round(totalMin * 0.3))
  const peak = Math.max(10, Math.round(totalMin * 0.4))
  const cool = Math.max(5, totalMin - warm - ramp - peak)
  return [warm, ramp, peak, Math.max(5, cool)]
}

/** 殺手 30 #25：免費用戶僅能編排 30 分鐘；付費 basic/premium 不限 */
const FREE_MAX_DURATION_MIN = 30

export async function POST(request: Request) {
  return handleApiError(async () => {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      throw validationError('Invalid JSON body')
    }
    if (!body || typeof body !== 'object') throw validationError('Body must be an object')

    const peopleCount = typeof body.peopleCount === 'number' ? Math.max(2, Math.min(12, body.peopleCount)) : 6
    let durationMin = typeof body.durationMin === 'number' ? Math.max(15, Math.min(240, body.durationMin)) : 120
    const tier = body.subscriptionTier === 'basic' || body.subscriptionTier === 'premium' ? body.subscriptionTier : 'free'
    if (tier === 'free') {
      durationMin = Math.min(durationMin, FREE_MAX_DURATION_MIN)
    }
    const allow18 = Boolean(body.allow18)
    const useAiTransition = Boolean(body.useAiTransition)

    const [warmMin, rampMin, peakMin, coolMin] = allocateDurations(durationMin)
    const transitionTexts = useAiTransition ? await generateTransitionTexts() : TRANSITIONS

    const phases = [
      {
        phase: PHASE_NAMES[0],
        durationMin: warmMin,
        gameIds: pickGameIds(peopleCount, false, 'party', 3),
        transitionText: transitionTexts['暖場'],
      },
      {
        phase: PHASE_NAMES[1],
        durationMin: rampMin,
        gameIds: pickGameIds(peopleCount, false, 'reaction', 3),
        transitionText: transitionTexts['升溫'],
      },
      {
        phase: PHASE_NAMES[2],
        durationMin: peakMin,
        gameIds: pickGameIds(peopleCount, allow18, allow18 ? 'adult' : 'party', 4),
        transitionText: transitionTexts['高潮'],
      },
      {
        phase: PHASE_NAMES[3],
        durationMin: coolMin,
        gameIds: pickGameIds(peopleCount, false, 'party', 2),
        transitionText: transitionTexts['收尾'],
      },
    ]

    return NextResponse.json({ phases, peopleCount, totalMin: durationMin })
  })
}
