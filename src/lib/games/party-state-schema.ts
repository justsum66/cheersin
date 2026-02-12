/**
 * PR-32：派對房 game_state payload 的 Zod 校驗
 * 供 POST /api/games/rooms/[slug]/game-state 使用（game_id=party-room）
 */
import { z } from 'zod'
import type { PartyState } from '@/types/games'

/** 派對房 state 結構校驗 */
export const PartyStateSchema = z.object({
  currentGameId: z.string().optional(),
  cheersCount: z.number().int().min(0).default(0),
})

export function parsePartyStatePayload(payload: unknown): { success: true; data: PartyState } | { success: false; error: string } {
  const result = PartyStateSchema.safeParse(payload)
  if (result.success) return { success: true, data: result.data }
  const msg = result.error.flatten().formErrors?.[0] ?? result.error.message
  return { success: false, error: msg }
}
