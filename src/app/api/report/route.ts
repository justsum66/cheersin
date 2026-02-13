/**
 * T059 P1 / P2-22：檢舉入口 API — 生產環境持久化至 reports 表
 * POST body: { type: string, description?: string, context?: { roomSlug?: string, gameId?: string } }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { ReportPostBodySchema } from '@/lib/api-body-schemas'
import { stripHtml } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

/** P3-44：檢舉 API 每 IP 每分鐘最多 5 次；SEC-003 Zod 校驗 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? request.headers.get('x-vercel-id') ?? undefined
  const start = Date.now()
  try {
    const ip = getClientIp(request.headers)
    if (await isRateLimitedAsync(ip, 'report')) {
      return NextResponse.json(
        { error: '操作過於頻繁，請稍後再試' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
    const raw = await request.json().catch(() => ({}))
    const parsed = ReportPostBodySchema.safeParse(raw)
    if (!parsed.success) return errorResponse(400, 'INVALID_BODY', { message: '請求參數格式錯誤' })
    const body = parsed.data
    const type = body.type ?? '其他'
    const description = stripHtml((body.description ?? '').slice(0, 500)).trim()
    const context = body.context ?? {}

    if (process.env.NODE_ENV === 'production') {
      const supabase = createServerClientOptional()
      if (supabase) {
        await supabase.from('reports').insert({
          type,
          description: description || '(未填寫)',
          context,
        })
      }
    }
    logger.info('api_report', { requestId, type, durationMs: Date.now() - start })
    return NextResponse.json({ received: true })
  } catch (e) {
    logger.error('api_report_error', { requestId, durationMs: Date.now() - start, error: e instanceof Error ? e.message : 'Unknown' })
    return errorResponse(400, 'Invalid request', { message: '請求格式錯誤' })
  }
}
