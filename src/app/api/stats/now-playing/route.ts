/**
 * 網紅優化 #6：即時互動數據 — 回傳「正在玩」人數，供大廳顯示增加 FOMO
 * GET /api/stats/now-playing → { count: number }
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createServerClient()
    const { count, error } = await supabase
      .from('game_rooms')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString())
    if (error) {
      return NextResponse.json({ count: 0 }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } })
    }
    return NextResponse.json(
      { count: Math.min(count ?? 0, 999) },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    )
  } catch {
    return NextResponse.json({ count: 0 }, { headers: { 'Cache-Control': 'public, s-maxage=10' } })
  }
}
