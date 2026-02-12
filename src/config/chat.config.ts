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

/** RAG（Pinecone）可配置：topK、相似問題數、namespace、最低相關分數（低於此過濾） */
const RAG_TOP_K = Math.min(20, Math.max(1, parseInt(process.env.RAG_TOP_K ?? '5', 10)))
const RAG_SIMILAR_TOP_K = Math.min(10, Math.max(1, parseInt(process.env.RAG_SIMILAR_TOP_K ?? '3', 10)))
export const RAG_NAMESPACE = (process.env.RAG_NAMESPACE ?? 'knowledge').trim() || 'knowledge'
/** 低於此 score 的 match 不納入 context（Pinecone 相似度 0～1）；未設或 0 表示不過濾 */
export const RAG_SCORE_MIN = parseFloat(process.env.RAG_SCORE_MIN ?? '0')
export const RAG_TOP_K_CONFIG = RAG_TOP_K
export const RAG_SIMILAR_TOP_K_CONFIG = RAG_SIMILAR_TOP_K
