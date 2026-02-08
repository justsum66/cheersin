/**
 * P2-389：AI 派對策劃師 — 編排引擎 API
 * POST /api/party-dj/plan：輸入人數、時長、是否含 18+，回傳階段與遊戲列表
 */
import { NextResponse } from 'next/server'
import { gamesWithCategory } from '@/config/games.config'

const PHASE_NAMES = ['暖場', '升溫', '高潮', '收尾'] as const
const TRANSITIONS: Record<string, string> = {
  暖場: '先來點輕鬆的，大家暖個身！',
  升溫: '氣氛起來了，接下來更刺激一點！',
  高潮: '派對最嗨的環節來了！',
  收尾: '最後收尾，大家乾一杯！',
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const peopleCount = typeof body.peopleCount === 'number' ? Math.max(2, Math.min(12, body.peopleCount)) : 6
    const durationMin = typeof body.durationMin === 'number' ? Math.max(15, Math.min(240, body.durationMin)) : 120
    const allow18 = Boolean(body.allow18)

    const [warmMin, rampMin, peakMin, coolMin] = allocateDurations(durationMin)

    const phases = [
      {
        phase: PHASE_NAMES[0],
        durationMin: warmMin,
        gameIds: pickGameIds(peopleCount, false, 'party', 3),
        transitionText: TRANSITIONS['暖場'],
      },
      {
        phase: PHASE_NAMES[1],
        durationMin: rampMin,
        gameIds: pickGameIds(peopleCount, false, 'reaction', 3),
        transitionText: TRANSITIONS['升溫'],
      },
      {
        phase: PHASE_NAMES[2],
        durationMin: peakMin,
        gameIds: pickGameIds(peopleCount, allow18, allow18 ? 'adult' : 'party', 4),
        transitionText: TRANSITIONS['高潮'],
      },
      {
        phase: PHASE_NAMES[3],
        durationMin: coolMin,
        gameIds: pickGameIds(peopleCount, false, 'party', 2),
        transitionText: TRANSITIONS['收尾'],
      },
    ]

    return NextResponse.json({ phases, peopleCount, totalMin: durationMin })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid request' },
      { status: 400 }
    )
  }
}
