/**
 * R2-017 / SEC-008：Cloudflare Turnstile 後端驗證
 * POST body: { token: string }
 * 回傳 { success: boolean }。前端僅在 success 為 true 後才呼叫 signIn/重設密碼，驗證失敗時不建立 session。
 */
import { NextRequest, NextResponse } from 'next/server'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function POST(request: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ success: true }, { status: 200 })
  }
  try {
    const body = (await request.json()) as { token?: string }
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    if (!token) {
      return NextResponse.json({ success: false }, { status: 400 })
    }
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const data = (await res.json()) as { success?: boolean }
    return NextResponse.json({ success: data.success === true }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
