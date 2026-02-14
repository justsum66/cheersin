/**
 * Open Brewery DB 整合：代理 https://api.openbrewerydb.org
 * 供遊戲或「隨機酒廠」等模組使用
 * GET ?random=1|5 或 ?search=xxx 或 ?by_city=xxx
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'

const BASE = 'https://api.openbrewerydb.org/v1/breweries'

export interface Brewery {
  id: string
  name: string
  brewery_type: string
  address_1: string | null
  city: string
  state_province: string
  postal_code: string
  country: string
  phone: string | null
  website_url: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const random = searchParams.get('random')
  const search = searchParams.get('search')
  const byCity = searchParams.get('by_city')
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '5', 10)))

  try {
    let url: string
    if (random !== null && random !== '') {
      const size = Math.min(10, Math.max(1, parseInt(random, 10) || 1))
      url = `${BASE}/random?size=${size}`
    } else if (search?.trim()) {
      url = `${BASE}/search?query=${encodeURIComponent(search.trim())}&per_page=${perPage}`
    } else if (byCity?.trim()) {
      url = `${BASE}?by_city=${encodeURIComponent(byCity.trim())}&per_page=${perPage}`
    } else {
      url = `${BASE}/random?size=5`
    }
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) {
      return errorResponse(502, 'UPSTREAM_ERROR', { message: 'Brewery API error' })
    }
    const data = await res.json()
    const list = Array.isArray(data) ? data : [data]
    return NextResponse.json({ breweries: list, source: 'openbrewerydb.org' })
  } catch (e) {
    return errorResponse(502, 'UPSTREAM_ERROR', { message: e instanceof Error ? e.message : 'Fetch failed' })
  }
}
