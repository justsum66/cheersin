/**
 * P2-385：AI 回答反饋送後端 — 讚/倒讚與選填文字，寫入 ai_feedback 供改進模型
 * POST /api/chat/feedback { messageId, helpful, comment? }
 * P0-01: Zod 校驗 | P0-11: 不暴露內部錯誤 | P0-16: 限流
 */
import { NextResponse } from 'next/server'
import { serverErrorResponse } from '@/lib/api-response'
import { createServerClientOptional } from '@/lib/supabase-server'
import { ChatFeedbackPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'chat_feedback')) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'RATE_LIMITED', message: '請求過於頻繁，請稍後再試' } }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
    )
  }

  const parsed = await zodParseBody(request, ChatFeedbackPostBodySchema)
  if (!parsed.success) return parsed.response

  const { messageId, helpful, comment } = parsed.data

  try {
    const supabase = createServerClientOptional()
    if (supabase) {
      type Insert = { from: (t: string) => { insert: (r: object) => Promise<{ error: { message: string } | null }> } }
      const { error } = await (supabase as unknown as Insert)
        .from('ai_feedback')
        .insert({ message_id: messageId, helpful, comment: comment ?? null })
      if (error) {
        return serverErrorResponse(error)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
