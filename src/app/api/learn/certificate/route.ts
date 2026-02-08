/**
 * P3-414：課程完成證書 — 查詢或建立證書
 * GET ?courseId=xxx → 該用戶該課程的證書（若有）
 * POST body { courseId } → 若課程已完成則建立證書並回傳
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { getCourse } from '@/lib/courses'

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
  let body: { courseId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : ''
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })
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
