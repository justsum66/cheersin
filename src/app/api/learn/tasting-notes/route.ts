/**
 * R2-381：品鑑筆記 API — 使用 wine_favorites 表（評分+照片+筆記）
 * GET: 回傳當前用戶的品鑑筆記列表
 * POST: body { wine_name, wine_type?, notes?, rating?, image_url? } 新增一筆
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import { createServerClientOptional } from '@/lib/supabase-server'
import { requireLearnAuth } from '@/lib/require-learn-auth'

export async function GET() {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  const { data, error } = await supabase
    .from('wine_favorites')
    .select('id, wine_name, wine_type, notes, rating, image_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) {
    return errorResponse(500, LEARN_ERROR.DB_ERROR, { message: error.message })
  }
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  let body: { wine_name?: string; wine_type?: string; notes?: string; rating?: number; image_url?: string }
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, LEARN_ERROR.INVALID_JSON, { message: LEARN_MESSAGE.INVALID_JSON })
  }
  const wineName = typeof body.wine_name === 'string' ? body.wine_name.trim() : ''
  if (!wineName) {
    return errorResponse(400, LEARN_ERROR.WINE_NAME_REQUIRED, { message: LEARN_MESSAGE.WINE_NAME_REQUIRED })
  }
  const rating = body.rating != null ? Number(body.rating) : null
  if (rating != null && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    return errorResponse(400, LEARN_ERROR.INVALID_RATING, { message: LEARN_MESSAGE.INVALID_RATING })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  const { data, error } = await supabase
    .from('wine_favorites')
    .insert({
      user_id: user.id,
      wine_name: wineName,
      wine_type: typeof body.wine_type === 'string' ? body.wine_type.trim() || null : null,
      notes: typeof body.notes === 'string' ? body.notes.trim() || null : null,
      rating: rating ?? null,
      image_url: typeof body.image_url === 'string' ? body.image_url.trim() || null : null,
    })
    .select('id, wine_name, wine_type, notes, rating, image_url, created_at')
    .single()
  if (error) {
    return errorResponse(500, LEARN_ERROR.DB_ERROR, { message: error.message })
  }
  return NextResponse.json({ item: data })
}
