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
  const res = await fetch('/api/party-dj/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? 'Plan API failed')
  }
  const data = await res.json()
  return { phases: data.phases ?? [], totalMin: data.totalMin ?? 0 }
}

export function usePartyDjPlan() {
  return useMutation({
    mutationFn: postPartyDjPlan,
    retry: 0,
  })
}
