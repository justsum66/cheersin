/**
 * DC-12：遊戲房間與狀態型別集中
 * 供 useGameRoom、API 回傳、派對房/劇本殺共用
 */

/** 通用房間資訊（GET /api/games/rooms/[slug] 回傳 room 欄位）；PR-42 集中型別 */
export interface RoomInfo {
  id: string
  slug: string
  hostId: string | null
  maxPlayers: number
  expiresAt: string | null
  /** 劇本殺房綁定劇本 ID */
  scriptId?: string | null
  /** 是否為劇本殺房 */
  scriptRoom?: boolean
}

/** GET /api/games/rooms/[slug] 回傳形狀；room 與 RoomInfo 對齊，另含 createdAt、hasPassword、anonymousMode */
export interface GamesRoomGetResponse {
  room: RoomInfo & { createdAt?: string; hasPassword?: boolean; anonymousMode?: boolean }
  players: Array<{ id: string; displayName: string; orderIndex: number; isSpectator?: boolean }>
}

/** 派對房 game_state payload（game_id=party-room）；PR-32 Zod 校驗用 */
export interface PartyState {
  currentGameId?: string
  cheersCount: number
}

/** 劇本殺遊戲狀態由 script-murder 模組定義，此處 re-export 供 api-bodies / 路由註解對齊 */
export type { ScriptState, ScriptMurderRoomInfo } from './script-murder'
