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

export { MAX_DISPLAY_NAME_LENGTH }
