import { NextRequest, NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/subscription-lifecycle'
import { logger } from '@/lib/logger'

/** 優惠碼驗證 API：POST { code } => { valid, discountPercent?, planId? } */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as import('@/types/api-bodies').SubscriptionPromoPostBody
    const code = body?.code?.trim()
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 })
    }
    const result = await validatePromoCode(code)
    return NextResponse.json(result)
  } catch (e) {
    logger.error('Subscription promo validation failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
  }
}
