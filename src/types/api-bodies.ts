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

/** POST /api/games/rooms — 建立房間 */
export interface GamesRoomsPostBody {
  password?: string
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
