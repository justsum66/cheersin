/**
 * 單一來源：所有 .env 變數經 normalize 後匯出，供 API、lib、scripts 使用。
 * 勿在此檔案寫入實際 key；僅讀取 process.env。
 */
import { normalizeEnv, normalizeUrl } from './env'

/** Groq：console.groq.com，必填（chat 主線） */
export const GROQ_API_KEY = normalizeEnv(process.env.GROQ_API_KEY)

/** NVIDIA NIM：build.nvidia.com API key（nvapi- 開頭），選填，chat fallback */
export const NVIDIA_NIM_API_KEY = normalizeEnv(process.env.NVIDIA_NIM_API_KEY)

/** OpenRouter：openrouter.ai，選填，embedding + chat fallback */
export const OPENROUTER_API_KEY = normalizeEnv(process.env.OPENROUTER_API_KEY)

/** Supabase：無尾端斜線 */
export const NEXT_PUBLIC_SUPABASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
export const SUPABASE_SERVICE_ROLE_KEY = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')

/** Pinecone：無尾端斜線 */
export const PINECONE_API_URL = normalizeUrl(process.env.PINECONE_API_URL)
export const PINECONE_API_KEY = normalizeEnv(process.env.PINECONE_API_KEY)

/** Resend：訂閱到期信 */
export const RESEND_API_KEY = normalizeEnv(process.env.RESEND_API_KEY)
export const RESEND_FROM_EMAIL = normalizeEnv(process.env.RESEND_FROM_EMAIL || 'Cheersin <onboarding@resend.dev>')

/** App 對外 URL、名稱 */
export const NEXT_PUBLIC_APP_URL = normalizeEnv(process.env.NEXT_PUBLIC_APP_URL) || 'https://cheersin.app'
export const NEXT_PUBLIC_APP_NAME = normalizeEnv(process.env.NEXT_PUBLIC_APP_NAME) || 'Cheersin'

/** Embedding：維度與模型（與 Pinecone index 一致） */
export const EMBEDDING_DIMENSION = (() => {
  const raw = process.env.EMBEDDING_DIMENSION
  const n = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(n) ? n : 1536
})()
export const EMBEDDING_MODEL = normalizeEnv(process.env.EMBEDDING_MODEL) || 'openai/text-embedding-3-small'

/** PayPal（訂閱） */
export const PAYPAL_CLIENT_ID = normalizeEnv(process.env.PAYPAL_CLIENT_ID)
export const PAYPAL_CLIENT_SECRET = normalizeEnv(process.env.PAYPAL_CLIENT_SECRET)
export const PAYPAL_WEBHOOK_ID = normalizeEnv(process.env.PAYPAL_WEBHOOK_ID)
export const PAYPAL_BASIC_PLAN_ID = normalizeEnv(process.env.PAYPAL_BASIC_PLAN_ID)
export const PAYPAL_PREMIUM_PLAN_ID = normalizeEnv(process.env.PAYPAL_PREMIUM_PLAN_ID)

/** Admin / Debug */
export const ADMIN_SECRET = normalizeEnv(process.env.ADMIN_SECRET)

/** 是否有 Groq（chat 主線） */
export const hasGroq = Boolean(GROQ_API_KEY)
/** 是否有 NIM（chat fallback） */
export const hasNim = Boolean(NVIDIA_NIM_API_KEY)
/** 是否有 OpenRouter（embedding + chat fallback） */
export const hasOpenRouter = Boolean(OPENROUTER_API_KEY)
/** 是否有 Pinecone（RAG） */
export const hasPinecone = Boolean(PINECONE_API_KEY && PINECONE_API_URL)
