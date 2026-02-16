/**
 * R2-383：課程討論區 API
 * GET: ?courseId=xxx 回傳該課程討論列表
 * POST: body { courseId, content } 新增一則討論
 * P0-02: Zod 校驗 | P0-12: 不暴露內部錯誤 | P0-17: 限流
 */
import { NextResponse } from 'next/server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import { createServerClientOptional } from '@/lib/supabase-server'
import { requireLearnAuth } from '@/lib/require-learn-auth'
import { LearnDiscussionsPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

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
  try {
    const { data, error } = await supabase
      .from('course_discussions')
      .select('id, course_id, user_id, content, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ items: data ?? [] })
  } catch (e) {
    return serverErrorResponse(e)
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'learn_discussions')) {
    return errorResponse(429, 'RATE_LIMITED', { message: '請求過於頻繁，請稍後再試' })
  }

  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response

  const parsed = await zodParseBody(request, LearnDiscussionsPostBodySchema, {
    invalidBodyMessage: 'courseId 與 content 為必填，content 最多 5000 字',
  })
  if (!parsed.success) return parsed.response
  const { courseId, content } = parsed.data

  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  try {
    const { data, error } = await supabase
      .from('course_discussions')
      .insert({ course_id: courseId, user_id: auth.user.id, content })
      .select('id, course_id, user_id, content, created_at')
      .single()
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ item: data })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
