/**
 * P2-30：API 請求 body 明確型別，取代 inline as { ... }，無 any
 * 與 api-body-schemas Zod schema 對齊：可從 @/lib/api-body-schemas 匯入推斷型別，此處 re-export 或保留無 schema 的介面
 */
import type {
  ChatPostBody as ChatPostBodyInferred,
  GamesRoomsPostBody as GamesRoomsPostBodyInferred,
  JoinRoomBody,
  RecommendPostBody as RecommendPostBodyInferred,
  ReportPostBody as ReportPostBodyInferred,
  LearnNotesPostBody as LearnNotesPostBodyInferred,
  LearnCertificatePostBody as LearnCertificatePostBodyInferred,
  SubscriptionPromoPostBody as SubscriptionPromoPostBodyInferred,
  SubscriptionPostBody as SubscriptionPostBodyInferred,
} from '@/lib/api-body-schemas'

/** POST /api/chat（型別與 ChatPostBodySchema 一致） */
export type ChatPostBody = ChatPostBodyInferred

/** POST /api/subscription（型別與 SubscriptionPostBodySchema 一致） */
export type SubscriptionPostBody = SubscriptionPostBodyInferred

/** PayPal subscription links 陣列（API 回傳） */
export interface PayPalLink {
  rel: string
  href?: string
}

/** PP-14：訂閱 API 回傳形狀（GET /api/subscription 或 useSubscription 對齊） */
export interface SubscriptionResponse {
  tier?: 'free' | 'basic' | 'premium'
  status?: string
  currentPeriodEnd?: string
  paypalSubscriptionId?: string
  links?: PayPalLink[]
}

/** PP-14：Webhook 收到之 PayPal 事件 payload 常用欄位（供 webhooks/paypal route 型別用） */
export interface PayPalWebhookEvent {
  id?: string
  event_type?: string
  resource?: Record<string, unknown>
  resource_type?: string
}

/** POST /api/report（型別與 ReportPostBodySchema 一致） */
export type ReportPostBody = ReportPostBodyInferred

/** POST /api/games/rooms — 建立房間（型別與 GamesRoomsPostBodySchema 一致） */
export type GamesRoomsPostBody = GamesRoomsPostBodyInferred

/** POST /api/games/rooms/[slug]/join（型別與 JoinRoomBodySchema 一致） */
export type GamesRoomJoinPostBody = JoinRoomBody

/** POST /api/games/rooms/[slug]/game-state；GET 回傳 state 型別見 @/types/games PartyState / ScriptState；PR-42 集中型別 */
export interface GameStatePostBody {
  game_id?: string
  payload?: Record<string, unknown>
}

/** 派對房／遊戲房間與狀態型別集中於 @/types/games；此處 re-export 供 API 與前端共用 */
export type { RoomInfo, PartyState, GamesRoomGetResponse } from './games'

/** POST /api/recommend（型別與 RecommendPostBodySchema 一致） */
export type RecommendPostBody = RecommendPostBodyInferred

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

/** POST /api/subscription/promo（型別與 SubscriptionPromoPostBodySchema 一致） */
export type SubscriptionPromoPostBody = SubscriptionPromoPostBodyInferred

/** POST /api/learn/notes（型別與 LearnNotesPostBodySchema 一致） */
export type LearnNotesPostBody = LearnNotesPostBodyInferred

/** POST /api/learn/certificate（型別與 LearnCertificatePostBodySchema 一致） */
export type LearnCertificatePostBody = LearnCertificatePostBodyInferred
