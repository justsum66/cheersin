/**
 * 殺手 #14/#18：劇本列表 API
 * GET /api/scripts — 回傳劇本摘要（含 18+ 依訂閱過濾）
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10) || 0)
    const slug = url.searchParams.get('slug') ?? undefined

    const supabase = createServerClient()
    let query = supabase
      .from('scripts')
      .select('id, title, slug, duration_min, min_players, max_players, is_18_plus')
      .order('created_at', { ascending: false })

    if (slug) {
      query = query.eq('slug', slug)
    }

    const { data: rows, error } = await query.range(offset, offset + limit - 1)
    if (error) return serverErrorResponse(error)

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

    const scripts = list
      .filter((s) => !s.is_18_plus || canAccess18)
      .map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        durationMin: s.duration_min,
        minPlayers: s.min_players,
        maxPlayers: s.max_players,
        is18Plus: s.is_18_plus ?? false,
      }))

    return NextResponse.json({
      scripts,
      meta: { limit, offset, count: scripts.length },
    })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
