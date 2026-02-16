/**
 * P3-412：課程筆記 API — 與 learning_notes 表同步；SEC-003 Zod 校驗
 * GET: ?courseId=xxx 回傳該課程下該用戶的筆記列表
 * POST: body { courseId, chapterId?, content } 新增或更新一則筆記
 * P0-13: 不暴露內部錯誤 | P0-18: 限流
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import { requireLearnAuth } from '@/lib/require-learn-auth'
import { LearnNotesPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')
  if (!courseId?.trim()) {
    return errorResponse(400, LEARN_ERROR.COURSE_ID_REQUIRED, { message: LEARN_MESSAGE.COURSE_ID_REQUIRED })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  try {
    const { data, error } = await supabase
      .from('learning_notes')
      .select('id, course_id, chapter_id, content, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId.trim())
      .order('chapter_id', { ascending: true })
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ notes: data ?? [] })
  } catch (e) {
    return serverErrorResponse(e)
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'learn_notes')) {
    return errorResponse(429, 'RATE_LIMITED', { message: '請求過於頻繁，請稍後再試' })
  }

  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  const parsed = await zodParseBody(request, LearnNotesPostBodySchema, {
    invalidBodyMessage: 'courseId 與 content 為必填，content 最多 10000 字',
  })
  if (!parsed.success) return parsed.response
  const { courseId, content, chapterId: chId } = parsed.data
  const chapterId = chId ?? null
  const supabase = createServerClientOptional()
  if (!supabase) {
    return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  }
  try {
    const { data, error } = await supabase
      .from('learning_notes')
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          chapter_id: chapterId,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id,chapter_id' }
      )
      .select('id, course_id, chapter_id, content, updated_at')
      .single()
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ note: data })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
