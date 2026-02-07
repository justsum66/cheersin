import { NextRequest, NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getPersistEventNames } from '@/config/analytics.config'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'

/** E29 需 Node runtime 以使用 Supabase server client 寫入 analytics_events */
/** P3-35：持久化事件白名單由 config 驅動 */
/** BE-11：name 長度上限、value 數字範圍、id 長度上限；統一 errorResponse */

const MAX_NAME_LENGTH = 128
const MAX_EVENT_ID_LENGTH = 256
const VALUE_MIN = 0
const VALUE_MAX = 1_000_000

/** RUM：接收 web-vitals 指標與關鍵轉換事件；E29 持久化至 Supabase analytics_events */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { name?: unknown; value?: unknown; id?: unknown; rating?: unknown }
    const { name: rawName, value: rawValue, id: rawId, rating } = body

    const name = typeof rawName === 'string' ? rawName.trim().slice(0, MAX_NAME_LENGTH) : ''
    if (!name) {
      return errorResponse(400, 'Invalid payload', { message: 'name 必填且為字串' })
    }

    const numValue = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : NaN
    if (Number.isNaN(numValue) || numValue < VALUE_MIN || numValue > VALUE_MAX) {
      return errorResponse(400, 'Invalid payload', { message: 'value 必填且為 0～1000000 數字' })
    }

    const eventId = typeof rawId === 'string' ? rawId.slice(0, MAX_EVENT_ID_LENGTH) : null

    /** BE-15/SEC-17：日誌不含 PII，不記錄 eventId/rating 避免洩漏 */
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RUM] ${name}: ${Math.round(numValue)}`)
    }

    /** E29：關鍵事件寫入 Supabase（不含 PII）；P1-13 不 await，fire-and-forget 不阻塞回應 */
    if (getPersistEventNames().has(name)) {
      const supabase = createServerClientOptional()
      if (supabase) {
        void supabase.from('analytics_events').insert({
          name,
          value: Math.round(numValue),
          event_id: eventId,
        }).then(({ error }) => {
          if (error) console.warn('[analytics] Supabase insert failed')
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
