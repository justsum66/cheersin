/**
 * R2-024：整合 Truth or Dare 外部 API
 * 從 api.truthordarebot.xyz 按 type=truth|dare、rating=PG|PG13|R 取得題目，伺服器端快取 5 分鐘
 */
import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import type { TruthDareLevel } from '@/lib/truth-or-dare'

const EXTERNAL_API_BASE = 'https://api.truthordarebot.xyz'
const CACHE_TTL_MS = 5 * 60 * 1000

type CacheEntry = { items: { text: string; level: TruthDareLevel }[]; ts: number }
const memoryCache = new Map<string, CacheEntry>()

function cacheKey(type: 'truth' | 'dare', rating: string): string {
  return `${type}:${rating}`
}

function mapRatingToLevel(rating: string): TruthDareLevel {
  if (rating === 'R') return 'adult'
  if (rating === 'PG13') return 'spicy'
  return 'mild'
}

/** 向外部 API 拉取一筆題目並正規化 */
async function fetchOne(
  type: 'truth' | 'dare',
  rating: string
): Promise<{ text: string; level: TruthDareLevel } | null> {
  const path = type === 'truth' ? '/v1/truth' : '/api/dare'
  const url = `${EXTERNAL_API_BASE}${path}?rating=${encodeURIComponent(rating)}`
  try {
    const res = await fetch(url, { next: { revalidate: 0 }, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = (await res.json()) as { question?: string; type?: string; rating?: string }
    const text = data.question?.trim()
    if (!text) return null
    const level = mapRatingToLevel(data.rating ?? rating)
    return { text, level }
  } catch {
    return null
  }
}

/** 延遲用（外部 API 限流約 5 req/5s） */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** 取得多筆題目（依序呼叫外部 API，避免觸發限流），並寫入快取 */
async function fetchAndCache(
  type: 'truth' | 'dare',
  rating: string,
  count: number
): Promise<{ text: string; level: TruthDareLevel }[]> {
  const key = cacheKey(type, rating)
  const now = Date.now()
  const cached = memoryCache.get(key)
  if (cached && now - cached.ts < CACHE_TTL_MS && cached.items.length >= count) {
    return cached.items.slice(0, count)
  }
  const items: { text: string; level: TruthDareLevel }[] = []
  const seen = new Set<string>()
  const maxCalls = Math.min(count, 8)
  for (let i = 0; i < maxCalls; i++) {
    const one = await fetchOne(type, rating)
    if (one && !seen.has(one.text)) {
      seen.add(one.text)
      items.push(one)
    }
    if (i < maxCalls - 1) await delay(1200)
  }
  memoryCache.set(key, { items, ts: now })
  return items
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') ?? 'truth') as 'truth' | 'dare'
  const rating = (searchParams.get('rating') ?? 'PG13') as string
  const count = Math.min(20, Math.max(1, Number(searchParams.get('count')) || 10))
  if (type !== 'truth' && type !== 'dare') {
    return errorResponse(400, 'INVALID_TYPE', { message: 'Invalid type' })
  }
  const items = await fetchAndCache(type, rating, count)
  return NextResponse.json({ items })
}
