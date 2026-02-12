/**
 * P3-412：課程筆記 API — 與 learning_notes 表同步；SEC-003 Zod 校驗
 * GET: ?courseId=xxx 回傳該課程下該用戶的筆記列表
 * POST: body { courseId, chapterId?, content } 新增或更新一則筆記
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse } from '@/lib/api-response'
import { LearnNotesPostBodySchema } from '@/lib/api-body-schemas'

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
  const raw = await request.json().catch(() => null)
  if (raw === null) return errorResponse(400, 'INVALID_JSON', { message: '請求 body 必須為有效 JSON' })
  const parsed = LearnNotesPostBodySchema.safeParse(raw)
  if (!parsed.success) return errorResponse(400, 'INVALID_BODY', { message: 'courseId 與 content 為必填，content 最多 10000 字' })
  const { courseId, content, chapterId: chId } = parsed.data
  const chapterId = chId ?? null
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
