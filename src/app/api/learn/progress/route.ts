/**
 * P3-411：課程進度同步 — GET 回傳後端進度，POST 寫入章節完成
 * GET: 需登入，回傳 { [courseId]: { completed, total, completedAt? } }
 * POST: body { courseId: string, chapterId: number }，寫入 chapter_progress
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { getCourse, getCourseIds } from '@/lib/courses'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { LearnProgressPostBodySchema } from '@/lib/api-body-schemas'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.id) return errorResponse(401, 'Unauthorized', { message: '請先登入' })
  try {
    const supabase = createServerClient()
    const { data: rows, error } = await supabase
      .from('chapter_progress')
      .select('course_id, chapter_id, completed_at')
      .eq('user_id', user.id)
    if (error) return serverErrorResponse(error)
    const byCourse = new Map<string, { completed: number; completedAt?: string }>()
    for (const r of rows ?? []) {
      const cur = byCourse.get(r.course_id) ?? { completed: 0 }
      cur.completed += 1
      if (r.completed_at && (!cur.completedAt || r.completed_at > cur.completedAt)) {
        cur.completedAt = r.completed_at
      }
      byCourse.set(r.course_id, cur)
    }
    const out: Record<string, { completed: number; total: number; completedAt?: string }> = {}
    const courseIds = getCourseIds()
    for (const courseId of courseIds) {
      const course = getCourse(courseId)
      const total = course?.chapters?.length ?? 0
      const rec = byCourse.get(courseId)
      const completed = rec?.completed ?? 0
      if (total > 0) {
        out[courseId] = { completed: Math.min(completed, total), total }
        if (rec?.completedAt) out[courseId].completedAt = rec.completedAt
      }
    }
    return NextResponse.json(out)
  } catch (e) {
    return serverErrorResponse(e)
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) return errorResponse(401, 'Unauthorized', { message: '請先登入' })
  let courseId: string
  let chapterId: number
  try {
    const raw = await request.json().catch(() => null)
    const parsed = LearnProgressPostBodySchema.safeParse(raw ?? {})
    if (!parsed.success) {
      return errorResponse(400, 'Bad request', { message: 'courseId 與 chapterId 為必填且有效' })
    }
    courseId = parsed.data.courseId
    chapterId = parsed.data.chapterId
  } catch {
    return errorResponse(400, 'Invalid JSON', { message: '請提供有效的 JSON' })
  }
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('chapter_progress').upsert(
      {
        user_id: user.id,
        course_id: courseId,
        chapter_id: chapterId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id,chapter_id', ignoreDuplicates: false }
    )
    if (error) return serverErrorResponse(error)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
