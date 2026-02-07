/**
 * P3-51：Chat 模型順序可配置，無需改 code 即可切換主線/fallback
 * env: CHAT_PRIMARY=groq|nim|openrouter；CHAT_FALLBACK_ORDER=groq,nim,openrouter（逗號分隔）
 */

export type ChatProvider = 'groq' | 'nim' | 'openrouter'

const PRIMARY = (process.env.CHAT_PRIMARY?.toLowerCase().trim() ?? 'groq') as ChatProvider
const VALID: ChatProvider[] = ['groq', 'nim', 'openrouter']
export const CHAT_PRIMARY: ChatProvider = VALID.includes(PRIMARY) ? PRIMARY : 'groq'

const orderStr = process.env.CHAT_FALLBACK_ORDER?.toLowerCase().trim()
const DEFAULT_ORDER: ChatProvider[] = ['groq', 'nim', 'openrouter']
const parsed = orderStr
  ? orderStr.split(',').map((s) => s.trim()).filter((s): s is ChatProvider => VALID.includes(s as ChatProvider))
  : []
/** 依序嘗試的 provider 列表（第一個為 primary） */
export const CHAT_FALLBACK_ORDER: ChatProvider[] = parsed.length > 0 ? parsed : DEFAULT_ORDER
