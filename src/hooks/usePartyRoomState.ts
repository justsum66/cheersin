'use client'

/**
 * PR-17：派對房遊戲狀態（乾杯數、房主選遊戲）— 基於 useGameState( slug, 'party-room' )
 * DC-12：PartyState 型別集中至 @/types/games
 */
import type { PartyState } from '@/types/games'
import { useGameState } from './useGameState'

export type { PartyState } from '@/types/games'

const PARTY_ROOM_GAME_ID = 'party-room'

export function usePartyRoomState(slug: string | null) {
  return useGameState<PartyState>(slug, PARTY_ROOM_GAME_ID)
}
