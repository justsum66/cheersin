/**
 * P2-385：AI 回答反饋送後端 — 讚/倒讚與選填文字，寫入 ai_feedback 供改進模型
 * POST /api/chat/feedback { messageId, helpful, comment? }
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'

export async function POST(request: Request) {
  let messageId: string
  let helpful: boolean
  let comment: string | undefined
  try {
    const body = await request.json()
    if (typeof body?.messageId !== 'string' || typeof body?.helpful !== 'boolean') {
      return NextResponse.json({ error: 'messageId and helpful required' }, { status: 400 })
    }
    messageId = body.messageId
    helpful = body.helpful
    comment = typeof body?.comment === 'string' ? body.comment.slice(0, 2000) : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServerClientOptional()
  if (supabase) {
    type Insert = { from: (t: string) => { insert: (r: object) => Promise<{ error: { message: string } | null }> } }
    const { error } = await (supabase as unknown as Insert)
      .from('ai_feedback')
      .insert({ message_id: messageId, helpful, comment: comment ?? null })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: true })
}
