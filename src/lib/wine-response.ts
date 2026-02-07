/**
 * AI 侍酒師結構化酒款響應解析（任務 141, 143-145）
 * 從助理回覆中抽出 [WINES]...[/WINES] JSON 區塊，回傳純文字與 WineCardData[]
 */

export interface WineCardDataFromAI {
  id: string
  name: string
  type: string
  region?: string
  country?: string
  description?: string
  imageUrl?: string | null
  price?: string | null
  rating?: number | null
  buyLink?: string | null
  variety?: string
  tags?: string[]
}

const WINES_START = '[WINES]'
const WINES_END = '[/WINES]'

/**
 * 從完整助理回覆中解析出純文字與酒款陣列。
 * 若無 [WINES]...[/WINES] 區塊，wines 為空陣列。
 */
export function parseWinesFromResponse(fullText: string): {
  text: string
  wines: WineCardDataFromAI[]
} {
  if (!fullText || typeof fullText !== 'string') {
    return { text: fullText ?? '', wines: [] }
  }
  const startIdx = fullText.indexOf(WINES_START)
  if (startIdx === -1) {
    return { text: fullText.trim(), wines: [] }
  }
  const endIdx = fullText.indexOf(WINES_END, startIdx)
  if (endIdx === -1) {
    return { text: fullText.trim(), wines: [] }
  }
  const before = fullText.slice(0, startIdx).trim()
  const after = fullText.slice(endIdx + WINES_END.length).trim()
  const text = [before, after].filter(Boolean).join('\n\n').trim() || fullText.trim()
  const rawJson = fullText.slice(startIdx + WINES_START.length, endIdx).trim()
  let wines: WineCardDataFromAI[] = []
  try {
    const parsed = JSON.parse(rawJson) as unknown
    if (Array.isArray(parsed)) {
      wines = parsed
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item, index) => normalizeWineItem(item, index))
        .filter((w): w is WineCardDataFromAI => w != null && Boolean(w.id && w.name && w.type))
    } else if (parsed && typeof parsed === 'object' && 'wines' in parsed && Array.isArray((parsed as { wines: unknown[] }).wines)) {
      const arr = (parsed as { wines: unknown[] }).wines
      wines = arr
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item, index) => normalizeWineItem(item, index))
        .filter((w): w is WineCardDataFromAI => w != null && Boolean(w.id && w.name && w.type))
    }
  } catch {
    /* invalid JSON → wines 保持 [] */
  }
  return { text, wines }
}

function normalizeWineItem(item: Record<string, unknown>, index: number): WineCardDataFromAI | null {
  const id = typeof item.id === 'string' ? item.id : `w-${index + 1}`
  const name = typeof item.name === 'string' ? item.name : String(item.name ?? '').slice(0, 200)
  const type = typeof item.type === 'string' ? item.type : String(item.type ?? '酒款').slice(0, 50)
  if (!name.trim()) return null
  return {
    id,
    name: name.trim(),
    type: type.trim() || '酒款',
    region: typeof item.region === 'string' ? item.region : undefined,
    country: typeof item.country === 'string' ? item.country : undefined,
    description: typeof item.description === 'string' ? item.description : undefined,
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : item.imageUrl == null ? null : undefined,
    price: typeof item.price === 'string' ? item.price : item.price == null ? null : undefined,
    rating: typeof item.rating === 'number' && Number.isFinite(item.rating) ? item.rating : null,
    buyLink: typeof item.buyLink === 'string' ? item.buyLink : item.buyLink == null ? null : undefined,
    variety: typeof item.variety === 'string' ? item.variety : undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === 'string').slice(0, 10) : undefined,
  }
}
