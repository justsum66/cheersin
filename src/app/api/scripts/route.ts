/**
 * 殺手 #14/#18：劇本列表 API
 * GET /api/scripts — 回傳劇本摘要（含 18+ 依訂閱過濾）
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { runSeedScriptsIfEmpty } from '@/lib/seed-script-murder'
import { logger } from '@/lib/logger'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

/** fallback=true 表示因連線錯誤回傳空列表，供前端顯示連線錯誤 */
function emptyScriptsResponse(limit: number, offset: number, fallback?: boolean) {
  const body: { scripts: unknown[]; meta: { limit: number; offset: number; count: number }; _fallback?: boolean } = {
    scripts: [],
    meta: { limit, offset, count: 0 },
  }
  if (fallback) body._fallback = true
  return NextResponse.json(body)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10) || 0)
  const slug = url.searchParams.get('slug') ?? undefined

  try {
    const supabase = createServerClient()
    let query = supabase
      .from('scripts')
      .select('id, title, slug, duration_min, min_players, max_players, is_18_plus')
      .order('created_at', { ascending: false })

    if (slug) {
      query = query.eq('slug', slug)
    }

    let { data: rows, error } = await query.range(offset, offset + limit - 1)
    if (error) {
      logger.warn('scripts query error', { err: error })
      return emptyScriptsResponse(limit, offset, true)
    }

    /** 當表為空時自動種子 8 支劇本，再重新查詢；種子失敗或仍空則回傳 _fallback（前端顯示連線/設定錯誤） */
    if ((rows ?? []).length === 0) {
      try {
        await runSeedScriptsIfEmpty(supabase)
      } catch (seedErr) {
        logger.warn('scripts seed if empty failed', { err: seedErr })
      }
      const res = await supabase
        .from('scripts')
        .select('id, title, slug, duration_min, min_players, max_players, is_18_plus')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (!res.error) rows = res.data
      /** 種子後仍空表示連線或 migrations 問題，回傳 _fallback 讓前端顯示連線錯誤 */
      if ((rows ?? []).length === 0) return emptyScriptsResponse(limit, offset, true)
    }

    const list = (rows ?? []) as Array<{
      id: string
      title: string
      slug: string | null
      duration_min: number | null
      min_players: number | null
      max_players: number | null
      is_18_plus: boolean | null
    }>

    /** #19：18+ 劇本 — 未登入或 free 不回傳 is_18_plus=true 的劇本（或僅回傳標題、鎖定） */
    const user = await getCurrentUser()
    let subscriptionTier: string = 'free'
    if (user?.id) {
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
      subscriptionTier = (profile?.subscription_tier as string) ?? 'free'
    }
    const canAccess18 = subscriptionTier === 'basic' || subscriptionTier === 'premium'

    const filtered = list.filter((s) => !s.is_18_plus || canAccess18)
    const scriptIds = filtered.map((s) => s.id)

    /** GAME-019：章節數與角色數供列表/預覽使用 */
    let chapterCountByScript: Record<string, number> = {}
    let roleCountByScript: Record<string, number> = {}
    if (scriptIds.length > 0) {
      const [chRes, rRes] = await Promise.all([
        supabase.from('script_chapters').select('script_id').in('script_id', scriptIds),
        supabase.from('script_roles').select('script_id').in('script_id', scriptIds),
      ])
      const countBy = (rows: Array<{ script_id: string }>) => {
        const out: Record<string, number> = {}
        for (const r of rows ?? []) {
          out[r.script_id] = (out[r.script_id] ?? 0) + 1
        }
        return out
      }
      chapterCountByScript = countBy((chRes.data ?? []) as Array<{ script_id: string }>)
      roleCountByScript = countBy((rRes.data ?? []) as Array<{ script_id: string }>)
    }

    const scripts = filtered.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      durationMin: s.duration_min,
      minPlayers: s.min_players,
      maxPlayers: s.max_players,
      is18Plus: s.is_18_plus ?? false,
      chapterCount: chapterCountByScript[s.id],
      roleCount: roleCountByScript[s.id],
    }))

    /** PERF-008：劇本列表可短快取 */
    return NextResponse.json(
      { scripts, meta: { limit, offset, count: scripts.length } },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    )
  } catch (e) {
    logger.error('GET /api/scripts failed', { err: e })
    return emptyScriptsResponse(limit, offset, true)
  }
}
