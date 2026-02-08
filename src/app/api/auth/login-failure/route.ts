/**
 * P2-348：記錄登入失敗（帳密錯誤時由前端呼叫）
 * POST /api/auth/login-failure { "email": "optional" }
 */
import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/rate-limit'
import { recordLoginFailure } from '@/lib/login-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  let email: string | undefined
  try {
    const body = await request.json()
    email = typeof body?.email === 'string' ? body.email : undefined
  } catch {
    email = undefined
  }
  recordLoginFailure(ip, email)
  return NextResponse.json({ ok: true })
}
