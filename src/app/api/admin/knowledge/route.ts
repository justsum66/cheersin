/**
 * GET: 列出知識庫文檔
 * POST: 新增文檔（content 向量化後寫入 Pinecone + Supabase）
 * 保護：x-admin-secret 常數時間比較（P0-04）或 NODE_ENV=development
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getEmbedding } from '@/lib/embedding'
import { upsertVectors, deleteVectors } from '@/lib/pinecone'
import { isAdminRequest } from '@/lib/admin-auth'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { ADMIN_ERROR, ADMIN_MESSAGE } from '@/lib/api-error-codes'
import { ADMIN_SECRET } from '@/lib/env-config'
import { logger } from '@/lib/logger'

const NAMESPACE_KNOWLEDGE = 'knowledge'
/** P3-45：Admin knowledge 欄位長度上限，防 DoS / 過大寫入 */
const MAX_TITLE_LENGTH = 200
const MAX_COURSE_ID_LENGTH = 100
const MAX_CHAPTER_LENGTH = 100
const MAX_CONTENT_LENGTH = 100_000

function isAdmin(request: NextRequest): boolean {
  return isAdminRequest(
    request.headers.get('x-admin-secret'),
    ADMIN_SECRET,
    process.env.NODE_ENV === 'development'
  )
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return errorResponse(401, ADMIN_ERROR.UNAUTHORIZED, { message: ADMIN_MESSAGE.UNAUTHORIZED })
  }
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('knowledge_docs')
      .select('id, title, course_id, chapter, content, vector_id, created_at, updated_at')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ docs: data ?? [] })
  } catch (e) {
    /** BE-15/SEC-17：日誌不含 PII/stack，僅 message */
    logger.error('Admin knowledge GET failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return errorResponse(401, ADMIN_ERROR.UNAUTHORIZED, { message: ADMIN_MESSAGE.UNAUTHORIZED })
  }
  try {
    const body = (await request.json()) as import('@/types/api-bodies').AdminKnowledgePostBody
    const { title, course_id, chapter, content } = body
    if (!title?.trim() || !course_id?.trim() || !chapter?.trim() || !content?.trim()) {
      return errorResponse(400, ADMIN_ERROR.INVALID_BODY, { message: ADMIN_MESSAGE.TITLE_COURSE_CHAPTER_CONTENT })
    }
    const t = title.trim()
    const cid = course_id.trim()
    const ch = chapter.trim()
    const cnt = content.trim()
    if (t.length > MAX_TITLE_LENGTH || cid.length > MAX_COURSE_ID_LENGTH || ch.length > MAX_CHAPTER_LENGTH || cnt.length > MAX_CONTENT_LENGTH) {
      return errorResponse(400, ADMIN_ERROR.FIELD_LENGTH_EXCEEDED, { message: `title≤${MAX_TITLE_LENGTH}, course_id≤${MAX_COURSE_ID_LENGTH}, chapter≤${MAX_CHAPTER_LENGTH}, content≤${MAX_CONTENT_LENGTH}` })
    }
    const supabase = createServerClient()
    const embedding = await getEmbedding(cnt.slice(0, 8000))
    if (!embedding?.length) {
      return errorResponse(500, ADMIN_ERROR.EMBEDDING_FAILED, { message: ADMIN_MESSAGE.EMBEDDING_FAILED })
    }
    const vectorId = `admin-${cid}-${ch}-${Date.now()}`.replace(/\s/g, '-')
    await upsertVectors(
      [{ id: vectorId, values: embedding, metadata: { text: cnt.slice(0, 40000), course_id: cid, chapter: ch, source: t } }],
      NAMESPACE_KNOWLEDGE
    )
    const { data: row, error } = await supabase
      .from('knowledge_docs')
      .insert({ title: t, course_id: cid, chapter: ch, content: cnt, vector_id: vectorId })
      .select('id, title, course_id, chapter, vector_id, created_at')
      .single()
    if (error) throw error
    return NextResponse.json({ doc: row })
  } catch (e) {
    logger.error('Admin knowledge POST failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}
