/**
 * P1-259：訂閱到期前提醒 — Cron
 * 在訂閱到期前 3 天和 1 天發送郵件。由 Vercel Cron 或外部排程呼叫。
 * 查詢即將到期的活躍訂閱 → 利用 subscription-lifecycle sendExpiryReminder 發送郵件。
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { CRON_SECRET } from '@/lib/env-config'
import { createServerClientOptional } from '@/lib/supabase-server'
import { sendExpiryReminder } from '@/lib/subscription-lifecycle'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** 到期前幾天發送提醒 */
const REMINDER_DAYS = [3, 1] as const

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return errorResponse(401, 'UNAUTHORIZED', { message: 'Unauthorized' })
  }

  const supabase = createServerClientOptional()
  if (!supabase) {
    return NextResponse.json({ ok: true, message: 'Supabase not configured, skipping' })
  }

  try {
    const now = new Date()
    let sentCount = 0
    let errorCount = 0

    for (const daysAhead of REMINDER_DAYS) {
      // 計算目標日期範圍：daysAhead 天後的 00:00 ~ 23:59
      const targetStart = new Date(now)
      targetStart.setDate(targetStart.getDate() + daysAhead)
      targetStart.setHours(0, 0, 0, 0)

      const targetEnd = new Date(targetStart)
      targetEnd.setHours(23, 59, 59, 999)

      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('user_id, tier, current_period_end, profiles!inner(email)')
        .eq('status', 'active')
        .gte('current_period_end', targetStart.toISOString())
        .lte('current_period_end', targetEnd.toISOString())

      if (error) {
        logger.error('[subscription-reminder] query error', { daysAhead, error: error.message })
        errorCount++
        continue
      }

      if (!subscriptions || subscriptions.length === 0) continue

      for (const sub of subscriptions) {
        const profile = sub.profiles as unknown as { email: string } | null
        const email = profile?.email
        if (!email) continue

        const ok = await sendExpiryReminder({
          userId: sub.user_id,
          email,
          tier: sub.tier ?? 'pro',
          expiresAt: sub.current_period_end,
          daysLeft: daysAhead,
        })

        if (ok) sentCount++
        else errorCount++
      }
    }

    logger.info('[subscription-reminder] cron completed', { sentCount, errorCount })
    return NextResponse.json({ ok: true, sentCount, errorCount })
  } catch (e) {
    return errorResponse(500, 'INTERNAL_ERROR', { message: String(e) })
  }
}
