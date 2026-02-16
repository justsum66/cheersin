/**
 * R2-381：品鑑筆記 API — 使用 wine_favorites 表（評分+照片+筆記）
 * GET: 回傳當前用戶的品鑑筆記列表
 * POST: body { wine_name, wine_type?, notes?, rating?, image_url? } 新增一筆
 * P0-08: Zod 校驗 | P0-14: 不暴露內部錯誤 | P0-19: 限流
 */
import { NextResponse } from 'next/server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import { createServerClientOptional } from '@/lib/supabase-server'
import { requireLearnAuth } from '@/lib/require-learn-auth'
import { TastingNotesPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

export async function GET() {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  try {
    const { data, error } = await supabase
      .from('wine_favorites')
      .select('id, wine_name, wine_type, notes, rating, image_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ items: data ?? [] })
  } catch (e) {
    return serverErrorResponse(e)
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'learn_tasting_notes')) {
    return errorResponse(429, 'RATE_LIMITED', { message: '請求過於頻繁，請稍後再試' })
  }

  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user

  const parsed = await zodParseBody(request, TastingNotesPostBodySchema)
  if (!parsed.success) return parsed.response
  const { wine_name, wine_type, notes, rating, image_url } = parsed.data

  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  try {
    const { data, error } = await supabase
      .from('wine_favorites')
      .insert({
        user_id: user.id,
        wine_name,
        wine_type: wine_type || null,
        notes: notes || null,
        rating: rating ?? null,
        image_url: image_url || null,
      })
      .select('id, wine_name, wine_type, notes, rating, image_url, created_at')
      .single()
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ item: data })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
