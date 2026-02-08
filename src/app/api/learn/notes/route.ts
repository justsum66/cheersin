/**
 * P3-412：課程筆記 API — 與 learning_notes 表同步
 * GET: ?courseId=xxx 回傳該課程下該用戶的筆記列表
 * POST: body { courseId, chapterId?, content } 新增或更新一則筆記
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')
  if (!courseId?.trim()) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  const { data, error } = await supabase
    .from('learning_notes')
    .select('id, course_id, chapter_id, content, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId.trim())
    .order('chapter_id', { ascending: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ notes: data ?? [] })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { courseId?: string; chapterId?: number; content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : ''
  const content = typeof body.content === 'string' ? body.content : ''
  if (!courseId || content.length > 10000) {
    return NextResponse.json({ error: 'courseId and content (max 10000 chars) required' }, { status: 400 })
  }
  const chapterId = typeof body.chapterId === 'number' && Number.isInteger(body.chapterId) ? body.chapterId : null
  const supabase = createServerClientOptional()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
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
      {
        onConflict: 'user_id,course_id,chapter_id',
      }
    )
    .select('id, course_id, chapter_id, content, updated_at')
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ note: data })
}
