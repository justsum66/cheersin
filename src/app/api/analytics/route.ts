import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getPersistEventNames } from '@/config/analytics.config'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

/** E29 需 Node runtime 以使用 Supabase server client 寫入 analytics_events */
/** R2-018：Zod 校驗 body；R2-027：結構化日誌 requestId、duration */

const AnalyticsBodySchema = z.object({
  name: z.string().min(1).max(128).trim(),
  value: z.number().min(0).max(1_000_000),
  id: z.string().max(256).optional(),
  rating: z.unknown().optional(),
})

/** RUM：接收 web-vitals 指標與關鍵轉換事件；E29 持久化至 Supabase analytics_events */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? request.headers.get('x-vercel-id') ?? undefined
  const start = Date.now()
  try {
    const raw = await request.json().catch(() => ({}))
    const parsed = AnalyticsBodySchema.safeParse(raw)
    if (!parsed.success) {
      logger.info('api_analytics_validation_failed', { requestId, errors: parsed.error.flatten() })
      return errorResponse(400, 'Invalid payload', { message: 'name 必填且為字串，value 必填且為 0～1000000 數字' })
    }
    const { name, value: numValue, id: rawId } = parsed.data
    const eventId = rawId ?? null

    if (process.env.NODE_ENV === 'development') {
      console.log(`[RUM] ${name}: ${Math.round(numValue)}`)
    }

    // 僅在 production 持久化至 Supabase，避免 dev 冷編譯時阻塞並降低 TTFB 影響
    if (process.env.NODE_ENV !== 'development' && getPersistEventNames().has(name)) {
      const supabase = createServerClientOptional()
      if (supabase) {
        void supabase.from('analytics_events').insert({
          name,
          value: Math.round(numValue),
          event_id: eventId,
        }).then(({ error }) => {
          if (error) logger.warn('analytics Supabase insert failed', { requestId })
        })
      }
    }

    logger.info('api_analytics', { requestId, name, durationMs: Date.now() - start })
    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('api_analytics_error', { requestId, durationMs: Date.now() - start, error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}
