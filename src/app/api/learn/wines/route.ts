/**
 * R2-382：酒款搜索 API — 從 data/wines.json 讀取靜態酒款列表
 * GET: ?q= 可選搜尋關鍵字（名稱、產區、類型、描述、標籤）
 */
import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

type WineItem = {
  id: string
  name: string
  type?: string
  region?: string
  country?: string
  description?: string
  tags?: string[]
  variety?: string
}

let cached: WineItem[] | null = null

function getWines(): WineItem[] {
  if (cached) return cached
  try {
    const p = path.join(process.cwd(), 'data', 'wines.json')
    const raw = readFileSync(p, 'utf-8')
    cached = JSON.parse(raw) as WineItem[]
    return cached ?? []
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const wines = getWines()
  const filtered = q
    ? wines.filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.type?.toLowerCase().includes(q) ||
          w.region?.toLowerCase().includes(q) ||
          w.country?.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.variety?.toLowerCase().includes(q) ||
          w.tags?.some((t) => t.toLowerCase().includes(q))
      )
    : wines
  return NextResponse.json({ items: filtered })
}
