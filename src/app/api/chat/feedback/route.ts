/**
 * P2-385：AI 回答反饋送後端 — 讚/倒讚與選填文字，寫入 ai_feedback 供改進模型
 * POST /api/chat/feedback { messageId, helpful, comment? }
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { createServerClientOptional } from '@/lib/supabase-server'

export async function POST(request: Request) {
  let messageId: string
  let helpful: boolean
  let comment: string | undefined
  try {
    const body = await request.json()
    if (typeof body?.messageId !== 'string' || typeof body?.helpful !== 'boolean') {
      return errorResponse(400, 'INVALID_BODY', { message: 'messageId and helpful required' })
    }
    messageId = body.messageId
    helpful = body.helpful
    comment = typeof body?.comment === 'string' ? body.comment.slice(0, 2000) : undefined
  } catch {
    return errorResponse(400, 'INVALID_JSON', { message: 'Invalid JSON' })
  }

  const supabase = createServerClientOptional()
  if (supabase) {
    type Insert = { from: (t: string) => { insert: (r: object) => Promise<{ error: { message: string } | null }> } }
    const { error } = await (supabase as unknown as Insert)
      .from('ai_feedback')
      .insert({ message_id: messageId, helpful, comment: comment ?? null })
    if (error) {
      return errorResponse(500, 'DB_ERROR', { message: error.message })
    }
  }
  return NextResponse.json({ ok: true })
}
