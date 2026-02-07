/**
 * GET /api/wine-knowledge：回傳 WSET Level 4 + CMS Level 3 + MW 等級 FAQ、酒杯指南、醒酒建議
 * 供前端靜態展示或 RAG 參考；P1-14：非同步讀檔 + 模組快取，不阻塞 event loop
 */
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const FAQ_PATH = path.join(process.cwd(), 'data', 'wine-knowledge', 'wine-faq-wset-cms-mw.json')

type CachedData = {
  meta: string
  faq: { q: string; a: string }[]
  glassGuide: { category: string; glass: string }[]
  decanting: { title: string; content: string }[]
  tastingTips: string[]
}

let cached: CachedData | null = null

async function loadWineKnowledge(): Promise<CachedData> {
  if (cached) return cached
  if (!existsSync(FAQ_PATH)) {
    return {
      meta: '',
      faq: [],
      glassGuide: [],
      decanting: [],
      tastingTips: [],
    }
  }
  const raw = await readFile(FAQ_PATH, 'utf8')
  const data = JSON.parse(raw) as {
    meta?: string
    faq?: { q: string; a: string }[]
    glassGuide?: { category: string; glass: string }[]
    decanting?: { title: string; content: string }[]
    tastingTips?: string[]
  }
  cached = {
    meta: data.meta ?? '',
    faq: data.faq ?? [],
    glassGuide: data.glassGuide ?? [],
    decanting: data.decanting ?? [],
    tastingTips: data.tastingTips ?? [],
  }
  return cached
}

export async function GET() {
  try {
    const data = await loadWineKnowledge()
    return NextResponse.json(data)
  } catch (e) {
    logger.error('wine-knowledge API failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return NextResponse.json(
      { error: 'Failed to load wine knowledge' },
      { status: 500 }
    )
  }
}
