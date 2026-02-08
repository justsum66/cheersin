/**
 * P2-395：AI 回答長期快取 — 常見問題（如「什麼是單寧？」）快取 24h，減少 API 調用與延遲
 * 與 chat/route 的 60s 快取並存：先查短期再查長期，回傳時寫入兩邊
 */

const LONG_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const LONG_CACHE_MAX = 100

interface LongCacheEntry {
  message: string
  sources: { index: number; source: string }[]
  similarQuestions: string[]
  at: number
}

const longCache = new Map<string, LongCacheEntry>()

/** 正規化問題作為 key：小寫、trim、截斷，避免變體造成漏命中 */
function normalizeQuestion(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 300)
}

export function getLongCached(
  lastUser: string,
  tier?: string
): { message: string; sources: { index: number; source: string }[]; similarQuestions: string[] } | null {
  const key = `${normalizeQuestion(lastUser)}|${tier === 'basic' || tier === 'premium' ? tier : 'free'}`
  const entry = longCache.get(key)
  if (!entry || Date.now() - entry.at > LONG_CACHE_TTL_MS) return null
  return { message: entry.message, sources: entry.sources, similarQuestions: entry.similarQuestions }
}

export function setLongCached(
  lastUser: string,
  tier: string | undefined,
  value: { message: string; sources: { index: number; source: string }[]; similarQuestions: string[] }
): void {
  if (longCache.size >= LONG_CACHE_MAX) {
    const oldest = [...longCache.entries()].sort((a, b) => a[1].at - b[1].at)[0]
    if (oldest) longCache.delete(oldest[0])
  }
  const key = `${normalizeQuestion(lastUser)}|${tier === 'basic' || tier === 'premium' ? tier : 'free'}`
  longCache.set(key, { ...value, at: Date.now() })
}

/** 是否視為「常見問答」可寫入長期快取：單則、長度適中、像問句 */
export function shouldLongCache(userMessage: string): boolean {
  const t = userMessage.trim()
  if (t.length > 200 || t.length < 5) return false
  return /[？?。.！!]/.test(t) || t.endsWith('?') || t.endsWith('？') || t.endsWith('嗎') || t.endsWith('什麼') || t.endsWith('如何')
}
