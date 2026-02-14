/**
 * P3-414：課程完成證書 — 查詢或建立證書；SEC-003 Zod 校驗
 * GET ?courseId=xxx → 該用戶該課程的證書（若有）
 * POST body { courseId } → 若課程已完成則建立證書並回傳
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getCourse } from '@/lib/courses'
import { errorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import { requireLearnAuth } from '@/lib/require-learn-auth'
import { LearnCertificatePostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'

export async function GET(request: Request) {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  const courseId = new URL(request.url).searchParams.get('courseId')?.trim()
  if (!courseId) return errorResponse(400, LEARN_ERROR.COURSE_ID_REQUIRED, { message: LEARN_MESSAGE.COURSE_ID_REQUIRED })
  const supabase = createServerClientOptional()
  if (!supabase) return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  const { data } = await supabase
    .from('certificates')
    .select('id, course_id, issued_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()
  return NextResponse.json({ certificate: data })
}

export async function POST(request: Request) {
  const auth = await requireLearnAuth()
  if (!auth.ok) return auth.response
  const user = auth.user
  const parsed = await zodParseBody(request, LearnCertificatePostBodySchema, { invalidBodyMessage: 'courseId 為必填' })
  if (!parsed.success) return parsed.response
  const courseId = parsed.data.courseId
  const course = getCourse(courseId)
  if (!course) return errorResponse(404, LEARN_ERROR.COURSE_NOT_FOUND, { message: LEARN_MESSAGE.COURSE_NOT_FOUND })
  const totalChapters = course.chapters?.length ?? 0
  if (totalChapters === 0) return errorResponse(400, LEARN_ERROR.COURSE_NO_CHAPTERS, { message: LEARN_MESSAGE.COURSE_NO_CHAPTERS })
  const supabase = createServerClientOptional()
  if (!supabase) return errorResponse(503, LEARN_ERROR.DB_NOT_CONFIGURED, { message: LEARN_MESSAGE.DB_NOT_CONFIGURED })
  const { count, error: countErr } = await supabase
    .from('chapter_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('course_id', courseId)
  if (countErr) return errorResponse(500, LEARN_ERROR.DB_ERROR, { message: countErr.message })
  const completed = Math.min(count ?? 0, totalChapters)
  if (completed < totalChapters) {
    return errorResponse(400, LEARN_ERROR.COURSE_NOT_COMPLETED, { message: LEARN_MESSAGE.COURSE_NOT_COMPLETED })
  }
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, issued_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ certificate: existing, created: false })
  }
  const { data: inserted, error } = await supabase
    .from('certificates')
    .insert({ user_id: user.id, course_id: courseId })
    .select('id, course_id, issued_at')
    .single()
  if (error) return errorResponse(500, LEARN_ERROR.DB_ERROR, { message: error.message })
  return NextResponse.json({ certificate: inserted, created: true })
}
