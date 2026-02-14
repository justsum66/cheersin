import { NextRequest, NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/subscription-lifecycle'
import { logger } from '@/lib/logger'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { SubscriptionPromoPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'

/** 優惠碼驗證 API：POST { code } => { valid, discountPercent?, planId? }；SEC-003 Zod 校驗 */
export async function POST(request: NextRequest) {
  try {
    const parsed = await zodParseBody(request, SubscriptionPromoPostBodySchema, { invalidBodyMessage: '缺少優惠碼' })
    if (!parsed.success) return parsed.response
    const result = await validatePromoCode(parsed.data.code)
    return NextResponse.json(result)
  } catch (e) {
    logger.error('Subscription promo validation failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}
