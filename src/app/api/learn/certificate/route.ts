/**
 * P3-414：課程完成證書 — 查詢或建立證書；SEC-003 Zod 校驗
 * GET ?courseId=xxx → 該用戶該課程的證書（若有）
 * POST body { courseId } → 若課程已完成則建立證書並回傳
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { getCourse } from '@/lib/courses'
import { errorResponse } from '@/lib/api-response'
import { LearnCertificatePostBodySchema } from '@/lib/api-body-schemas'

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const courseId = new URL(request.url).searchParams.get('courseId')?.trim()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })
  const supabase = createServerClientOptional()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const { data } = await supabase
    .from('certificates')
    .select('id, course_id, issued_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()
  return NextResponse.json({ certificate: data })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const raw = await request.json().catch(() => null)
  if (raw === null) return errorResponse(400, 'INVALID_JSON', { message: '請求 body 必須為有效 JSON' })
  const parsed = LearnCertificatePostBodySchema.safeParse(raw)
  if (!parsed.success) return errorResponse(400, 'INVALID_BODY', { message: 'courseId 為必填' })
  const courseId = parsed.data.courseId
  const course = getCourse(courseId)
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  const totalChapters = course.chapters?.length ?? 0
  if (totalChapters === 0) return NextResponse.json({ error: 'Course has no chapters' }, { status: 400 })
  const supabase = createServerClientOptional()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const { count, error: countErr } = await supabase
    .from('chapter_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('course_id', courseId)
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 })
  const completed = Math.min(count ?? 0, totalChapters)
  if (completed < totalChapters) {
    return NextResponse.json({ error: 'Course not completed', completed, total: totalChapters }, { status: 400 })
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ certificate: inserted, created: true })
}
