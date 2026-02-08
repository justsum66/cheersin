/**
 * P1-259：訂閱到期前提醒 — Cron 占位
 * 在訂閱到期前 3 天和 1 天發送郵件與站內通知。由 Vercel Cron 或外部排程呼叫。
 * 實作時：查詢即將到期的訂閱 → 發送郵件 / 寫入 notifications 表。
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // TODO: 查詢 current_period_end 在 3 天內與 1 天內的訂閱，發送提醒
    return NextResponse.json({ ok: true, message: 'subscription-reminder cron placeholder' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
