/**
 * PUT: 更新知識庫文檔（重新向量化並更新 Pinecone）
 * DELETE: 刪除文檔（Supabase + Pinecone）
 * 保護：x-admin-secret 常數時間比較（P0-04）或 NODE_ENV=development
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getEmbedding } from '@/lib/embedding'
import { upsertVectors, deleteVectors } from '@/lib/pinecone'
import { isAdminRequest } from '@/lib/admin-auth'
import { serverErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

const NAMESPACE_KNOWLEDGE = 'knowledge'

function isAdmin(request: NextRequest): boolean {
  return isAdminRequest(
    request.headers.get('x-admin-secret'),
    process.env.ADMIN_SECRET,
    process.env.NODE_ENV === 'development'
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    const body = (await request.json()) as import('@/types/api-bodies').AdminKnowledgePatchBody
    const supabase = createServerClient()
    const { data: existing, error: fetchErr } = await supabase
      .from('knowledge_docs')
      .select('id, vector_id, content, course_id, chapter, title')
      .eq('id', id)
      .single()
    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Doc not found' }, { status: 404 })
    }
    const title = body.title ?? existing.title
    const course_id = body.course_id ?? existing.course_id
    const chapter = body.chapter ?? existing.chapter
    const content = body.content ?? existing.content
    const embedding = await getEmbedding(content.slice(0, 8000))
    if (!embedding?.length) {
      return NextResponse.json({ error: 'Embedding failed' }, { status: 500 })
    }
    const vectorId = existing.vector_id ?? `admin-${id}-${Date.now()}`
    if (existing.vector_id) {
      await deleteVectors([existing.vector_id], NAMESPACE_KNOWLEDGE)
    }
    await upsertVectors(
      [{ id: vectorId, values: embedding, metadata: { text: content.slice(0, 40000), course_id, chapter, source: title } }],
      NAMESPACE_KNOWLEDGE
    )
    const { data: row, error } = await supabase
      .from('knowledge_docs')
      .update({ title, course_id, chapter, content, vector_id: vectorId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, title, course_id, chapter, updated_at')
      .single()
    if (error) throw error
    return NextResponse.json({ doc: row })
  } catch (e) {
    logger.error('Admin knowledge PUT failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(_request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    const supabase = createServerClient()
    const { data: existing, error: fetchErr } = await supabase
      .from('knowledge_docs')
      .select('vector_id')
      .eq('id', id)
      .single()
    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Doc not found' }, { status: 404 })
    }
    if (existing.vector_id) {
      await deleteVectors([existing.vector_id], NAMESPACE_KNOWLEDGE)
    }
    const { error: delErr } = await supabase.from('knowledge_docs').delete().eq('id', id)
    if (delErr) throw delErr
    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('Admin knowledge DELETE failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}
