/**
 * SEC-003：API 請求 body Zod 校驗 schema 集中
 * 供 leave、join、subscription、verify-turnstile、games/rooms 等 route 使用
 */
import { z } from 'zod'

/** POST /api/games/rooms/[slug]/leave */
export const LeaveRoomBodySchema = z.object({
  playerId: z.string().min(1, 'playerId required').trim(),
})

/** POST /api/games/rooms/[slug]/join */
const MAX_DISPLAY_NAME_LENGTH = 20
export const JoinRoomBodySchema = z.object({
  displayName: z.string().min(1, 'displayName required').max(MAX_DISPLAY_NAME_LENGTH).trim(),
  password: z.string().optional(),
  isSpectator: z.boolean().optional(),
})

/** POST /api/subscription — action 白名單與 subscriptionId 長度上限 */
const SUBSCRIPTION_ACTIONS = ['create-subscription', 'capture-subscription', 'cancel-subscription'] as const
export const MAX_SUBSCRIPTION_ID_LENGTH = 256
export const SubscriptionPostBodySchema = z.object({
  action: z.enum(SUBSCRIPTION_ACTIONS),
  planType: z.string().optional(),
  subscriptionId: z.string().max(MAX_SUBSCRIPTION_ID_LENGTH).optional(),
})

/** POST /api/auth/verify-turnstile */
export const VerifyTurnstileBodySchema = z.object({
  token: z.string().min(1, 'token required').trim(),
})

/** POST /api/chat — messages 與可選欄位；長度上限由 route 再驗 */
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
})
export const ChatPostBodySchema = z.object({
  messages: z.array(ChatMessageSchema),
  userContext: z.record(z.string(), z.unknown()).optional(),
  last5Turns: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  stream: z.boolean().optional(),
  imageBase64: z.string().optional(),
  subscriptionTier: z.enum(['free', 'basic', 'premium']).optional(),
})

/** POST /api/games/rooms — 建立房間 body */
export const GamesRoomsPostBodySchema = z.object({
  password: z.string().regex(/^\d{4}$/).optional(),
  anonymousMode: z.boolean().optional(),
  partyRoom: z.boolean().optional(),
  maxPlayers: z.union([z.literal(4), z.literal(8), z.literal(12)]).optional(),
  scriptId: z.string().max(64).trim().optional(),
})

/** PATCH /api/games/rooms/[slug] — 房主更新設定 */
export const GamesRoomsPatchBodySchema = z.object({
  anonymousMode: z.boolean().optional(),
  endRoom: z.boolean().optional(),
})

/** POST /api/learn/progress — 更新進度 body（courseId、chapterId 必填） */
export const LearnProgressPostBodySchema = z.object({
  courseId: z.string().trim().min(1, 'courseId required'),
  chapterId: z.number().int().min(0),
})

/** POST /api/games/rooms/[slug]/script-murder — 劇本殺動作 body */
const SCRIPT_MURDER_ACTIONS = ['advance', 'vote', 'punishment_done'] as const
export const ScriptMurderPostBodySchema = z.object({
  action: z.enum(SCRIPT_MURDER_ACTIONS),
  playerId: z.string().trim().optional(),
  option: z.string().trim().optional(),
})

/** POST /api/recommend — 推薦酒款/知識 body；namespace 白名單 wines | knowledge */
const RECOMMEND_NAMESPACES = ['wines', 'knowledge'] as const
export const RecommendPostBodySchema = z.object({
  query: z.string().trim().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  vector: z.array(z.number()).optional(),
  topK: z.number().int().min(1).max(20).optional(),
  namespace: z.enum(RECOMMEND_NAMESPACES).optional(),
  soul_wine: z.string().trim().optional(),
  soul_wine_type: z.string().trim().optional(),
  quiz_tags: z.array(z.string()).optional(),
  recentChat: z.string().optional(),
})

/** POST /api/report — 檢舉 body；type 白名單與 REPORT_TYPES 一致 */
const REPORT_TYPES = ['不當內容', '騷擾', '作弊或濫用', '其他'] as const
export const ReportPostBodySchema = z.object({
  type: z.enum(REPORT_TYPES).optional(),
  description: z.string().max(500).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
})

/** POST /api/learn/notes — 課程筆記 body */
const LEARN_NOTES_CONTENT_MAX = 10000
export const LearnNotesPostBodySchema = z.object({
  courseId: z.string().trim().min(1, 'courseId required'),
  chapterId: z.number().int().min(0).optional(),
  content: z.string().max(LEARN_NOTES_CONTENT_MAX),
})

/** POST /api/learn/certificate — 證書 body */
export const LearnCertificatePostBodySchema = z.object({
  courseId: z.string().trim().min(1, 'courseId required'),
})

/** POST /api/subscription/promo — 優惠碼驗證 body */
export const SubscriptionPromoPostBodySchema = z.object({
  code: z.string().min(1, 'code required').trim(),
})

/** 從 schema 推型別，供 api-bodies 與 route 共用，確保與 Zod 一致 */
export type GamesRoomsPostBody = z.infer<typeof GamesRoomsPostBodySchema>
export type GamesRoomsPatchBody = z.infer<typeof GamesRoomsPatchBodySchema>
export type JoinRoomBody = z.infer<typeof JoinRoomBodySchema>
export type LeaveRoomBody = z.infer<typeof LeaveRoomBodySchema>
export type RecommendPostBody = z.infer<typeof RecommendPostBodySchema>
export type ReportPostBody = z.infer<typeof ReportPostBodySchema>
export type LearnNotesPostBody = z.infer<typeof LearnNotesPostBodySchema>
export type LearnCertificatePostBody = z.infer<typeof LearnCertificatePostBodySchema>
export type LearnProgressPostBody = z.infer<typeof LearnProgressPostBodySchema>
export type ScriptMurderPostBody = z.infer<typeof ScriptMurderPostBodySchema>
export type SubscriptionPromoPostBody = z.infer<typeof SubscriptionPromoPostBodySchema>
export type SubscriptionPostBody = z.infer<typeof SubscriptionPostBodySchema>
export type ChatPostBody = z.infer<typeof ChatPostBodySchema>
export type VerifyTurnstileBody = z.infer<typeof VerifyTurnstileBodySchema>

export { MAX_DISPLAY_NAME_LENGTH }
