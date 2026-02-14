/**
 * R2-383：課程討論區 API
 * GET: ?courseId=xxx 回傳該課程討論列表（含 user 顯示名）
 * POST: body { courseId, content } 新增一則討論
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import { createServerClientOptional } from '@/lib/supabase-server'
import { requireLearnAuth } from '@/lib/require-learn-auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')?.trim()
  if (!courseId) {
    return errorResponse(400, LEARN_ERROR.COURSE_ID_REQUIRED, { message: LEARN_MESSAGE.COURSE_ID_REQUIRED })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  const { data, error } = await supabase
    .from('course_discussions')
    .select('id, course_id, user_id, content, created_at')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    return errorResponse(500, LEARN_ERROR.DB_ERROR, { message: error.message })
  }
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  let body: { courseId?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, LEARN_ERROR.INVALID_JSON, { message: LEARN_MESSAGE.INVALID_JSON })
  }
  const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!courseId || !content) {
    return errorResponse(400, LEARN_ERROR.INVALID_BODY, { message: LEARN_MESSAGE.COURSE_ID_AND_CONTENT })
  }
  if (content.length > 5000) {
    return errorResponse(400, LEARN_ERROR.CONTENT_TOO_LONG, { message: LEARN_MESSAGE.CONTENT_TOO_LONG })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  const { data, error } = await supabase
    .from('course_discussions')
    .insert({
      course_id: courseId,
      user_id: user.id,
      content,
    })
    .select('id, course_id, user_id, content, created_at')
    .single()
  if (error) {
    return errorResponse(500, LEARN_ERROR.DB_ERROR, { message: error.message })
  }
  return NextResponse.json({ item: data })
}
