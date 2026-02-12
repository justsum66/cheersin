import { NextRequest, NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/subscription-lifecycle'
import { logger } from '@/lib/logger'
import { errorResponse } from '@/lib/api-response'
import { SubscriptionPromoPostBodySchema } from '@/lib/api-body-schemas'

/** 優惠碼驗證 API：POST { code } => { valid, discountPercent?, planId? }；SEC-003 Zod 校驗 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null)
    if (raw === null) return errorResponse(400, 'INVALID_JSON', { message: '請求 body 必須為有效 JSON' })
    const parsed = SubscriptionPromoPostBodySchema.safeParse(raw)
    if (!parsed.success) return errorResponse(400, 'INVALID_BODY', { message: '缺少優惠碼' })
    const result = await validatePromoCode(parsed.data.code)
    return NextResponse.json(result)
  } catch (e) {
    logger.error('Subscription promo validation failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
  }
}
