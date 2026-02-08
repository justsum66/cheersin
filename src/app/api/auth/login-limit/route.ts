/**
 * P2-348：查詢登入嘗試限制狀態（送出前檢查）
 * GET /api/auth/login-limit?email=xxx → { allowed, remainingAttempts, resetAt }
 */
import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/rate-limit'
import { checkLoginLimit } from '@/lib/login-limit'

export async function GET(request: Request) {
  const ip = getClientIp(request.headers)
  const url = new URL(request.url)
  const email = url.searchParams.get('email') ?? undefined
  const { allowed, remainingAttempts, resetAt } = checkLoginLimit(ip, email)
  return NextResponse.json({ allowed, remainingAttempts, resetAt })
}
