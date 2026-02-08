/**
 * P2-350：安全事件通知 — 登入/密碼變更等事件記錄，可擴充為發送郵件
 * POST body: { event: 'login' | 'password_change', email?: string }
 * 未設定發信時僅記錄日誌，不阻擋流程
 */
import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  let event: string
  let email: string | undefined
  try {
    const body = await request.json()
    event = typeof body?.event === 'string' ? body.event : ''
    email = typeof body?.email === 'string' ? body.email.trim().slice(0, 256) : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!event || !['login', 'password_change'].includes(event)) {
    return NextResponse.json({ error: 'event must be login or password_change' }, { status: 400 })
  }
  const ip = getClientIp(request.headers)
  logger.info('security_event', { event, hasEmail: !!email, ip })
  // 可擴充：若 RESEND_API_KEY 等已設定，在此發送通知郵件
  return NextResponse.json({ ok: true })
}
