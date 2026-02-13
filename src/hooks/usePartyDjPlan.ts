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

export function usePartyDjPlan() {
  return useMutation({
    mutationFn: postPartyDjPlan,
    retry: 0,
  })
}
