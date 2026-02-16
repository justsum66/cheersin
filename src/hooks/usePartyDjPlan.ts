/**
 * R2-025：Party DJ 編排 useMutation — 統一重試、可與 cache 並存
 */
import { useMutation } from '@tanstack/react-query'

export interface PartyDjPlanBody {
  peopleCount: number
  durationMin: number
  allow18: boolean
  useAiTransition: boolean
  subscriptionTier: string
  mood: 'relaxed' | 'intense' | 'mixed'
}

export interface PhaseItem {
  phase: string
  durationMin: number
  gameIds: string[]
  transitionText: string
}

export interface PartyDjPlanResult {
  phases: PhaseItem[]
  totalMin: number
}

async function postPartyDjPlan(body: PartyDjPlanBody): Promise<PartyDjPlanResult> {
  const res = await fetch('/api/v1/party-dj/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))

  if (!res.ok || !json.success) {
    const msg = json.error?.message || json.message || 'Plan API failed'
    throw new Error(msg)
  }

  const data = json.data
  return { phases: data.phases ?? [], totalMin: data.totalMin ?? 0 }
}

/** Phase 1 Task 16：免費方案每日 1 次 Party DJ 計畫上限 */
const PARTY_DJ_DAILY_KEY = 'cheersin_party_dj_daily'
const FREE_DAILY_PLAN_LIMIT = 1

function getDailyPlanCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(PARTY_DJ_DAILY_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw) as { date: string; count: number }
    if (date !== new Date().toISOString().slice(0, 10)) return 0
    return count
  } catch {
    return 0
  }
}

function incrementDailyPlanCount(): void {
  if (typeof window === 'undefined') return
  try {
    const today = new Date().toISOString().slice(0, 10)
    const current = getDailyPlanCount()
    localStorage.setItem(PARTY_DJ_DAILY_KEY, JSON.stringify({ date: today, count: current + 1 }))
  } catch {
    /* ignore */
  }
}

export function usePartyDjPlan() {
  const mutation = useMutation({
    mutationFn: postPartyDjPlan,
    retry: 0,
    onSuccess: () => incrementDailyPlanCount(),
  })

  return {
    ...mutation,
    /** Phase 1 Task 16：免費方案每日計畫次數 */
    dailyPlansUsed: getDailyPlanCount(),
    canGenerate: (tier: string) => tier !== 'free' || getDailyPlanCount() < FREE_DAILY_PLAN_LIMIT,
    FREE_DAILY_PLAN_LIMIT,
  }
}
