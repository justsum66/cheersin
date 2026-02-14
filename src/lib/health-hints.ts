/**
 * Health 端點除錯提示 — 依服務名稱與錯誤訊息回傳 hint（不暴露 key）
 */
export const HEALTH_SERVICE = {
  SUPABASE: 'Supabase',
  GROQ: 'Groq AI',
  OPENROUTER: 'OpenRouter',
  PINECONE: 'Pinecone',
  PAYPAL: 'PayPal',
} as const

export function hintFor(name: string, message: string): string {
  const m = message.toLowerCase()
  if (name === HEALTH_SERVICE.SUPABASE) {
    if (m.includes('dns') || m.includes('enotfound') || m.includes('fetch failed')) return 'NEXT_PUBLIC_SUPABASE_URL unreachable. Use wdegandlipgdvqhgmoai.supabase.co; project may be paused (Dashboard → Restore).'
    if (m.includes('missing') || m.includes('env')) return 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  }
  if (name === HEALTH_SERVICE.GROQ) {
    if (m.includes('429') || m.includes('rate limit')) return 'Groq rate limit; chat will fallback to next provider. Retry later or upgrade Groq tier.'
    if (m.includes('401') || m.includes('invalid') || m.includes('api key')) return 'Fix GROQ_API_KEY in .env.local (get key at console.groq.com)'
  }
  if (name === HEALTH_SERVICE.OPENROUTER) {
    if (m.includes('401') || m.includes('user not found')) return 'Fix OPENROUTER_API_KEY in .env.local (get key at openrouter.ai/keys)'
    if (m.includes('402') || m.includes('credits')) return 'Add credits at openrouter.ai/settings/credits or reduce max_tokens'
  }
  if (name === HEALTH_SERVICE.PINECONE) {
    if (m.includes('401') || m.includes('unauthorized')) {
      return 'Use index HOST as PINECONE_API_URL. Ensure PINECONE_API_KEY is from same project (console → API Keys).'
    }
    if (m.includes('403') || m.includes('forbidden')) {
      return 'Key valid but 403 Forbidden: API key may lack ReadWrite for this index, or key/index from different project. Create key in same project as index.'
    }
  }
  if (name === HEALTH_SERVICE.PAYPAL) {
    if (m.includes('401') || m.includes('invalid') || m.includes('unauthorized')) return 'Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET (developer.paypal.com).'
    if (m.includes('env') || m.includes('not set')) return 'Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local for subscription.'
  }
  return ''
}
