/**
 * P2-30：API 請求 body 明確型別，取代 inline as { ... }，無 any
 * 供 chat、subscription、games、report、recommend、admin 等 route 使用
 */

import type { ChatMessage, SommelierUserContext } from '@/lib/groq'

/** POST /api/chat */
export interface ChatPostBody {
  messages: ChatMessage[]
  userContext?: SommelierUserContext
  last5Turns?: { role: string; content: string }[]
  stream?: boolean
  imageBase64?: string
  subscriptionTier?: 'free' | 'basic' | 'premium'
}

/** POST /api/subscription */
export interface SubscriptionPostBody {
  action?: string
  planType?: string
  subscriptionId?: string
}

/** PayPal subscription links 陣列（API 回傳） */
export interface PayPalLink {
  rel: string
  href?: string
}

/** POST /api/report */
export interface ReportPostBody {
  type?: string
  description?: string
  context?: { roomSlug?: string; gameId?: string }
}

/** POST /api/games/rooms — 建立房間；P0-004 匿名模式；Killer 派對房：房限與邀請；#14 劇本殺房 */
export interface GamesRoomsPostBody {
  password?: string
  /** 房主開啟後，所有玩家暱稱顯示為玩家A、玩家B… */
  anonymousMode?: boolean
  /** 派對房模式：免費 4 人/30 分鐘，付費 12 人/24 小時 */
  partyRoom?: boolean
  /** 劇本殺房：綁定 script_id，人數與邀請路徑依劇本 */
  scriptId?: string
}

/** POST /api/games/rooms/[slug]/join */
export interface GamesRoomJoinPostBody {
  displayName?: string
  password?: string
  isSpectator?: boolean
}

/** POST /api/games/rooms/[slug]/game-state */
export interface GameStatePostBody {
  game_id?: string
  payload?: Record<string, unknown>
}

/** POST /api/recommend */
export interface RecommendPostBody {
  query?: string
  limit?: number
  vector?: number[]
  topK?: number
  namespace?: string
  soul_wine?: string
  soul_wine_type?: string
  quiz_tags?: string[]
  recentChat?: string
}

/** POST /api/admin/knowledge */
export interface AdminKnowledgePostBody {
  title: string
  course_id: string
  chapter: string
  content: string
}

/** PATCH /api/admin/knowledge/[id] */
export interface AdminKnowledgePatchBody {
  title?: string
  course_id?: string
  chapter?: string
  content?: string
}

/** POST /api/subscription/promo */
export interface SubscriptionPromoPostBody {
  code?: string
}
