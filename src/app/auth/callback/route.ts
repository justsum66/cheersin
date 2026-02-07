/**
 * Supabase Auth callback：OAuth 與魔法連結登入後導向此路由，
 * 以 code 換取 session 並寫入 cookie，再導向 next 或 /profile。
 * Dashboard 須設定 Redirect URL：https://yourdomain.com/auth/callback、http://localhost:3000/auth/callback
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { normalizeEnv, normalizeUrl } from '@/lib/env'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/profile'

  // P0-03：防 open redirect — 禁止絕對 URL 或含 // 的 next
  const trimmed = next.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('//')) {
    next = '/profile'
  } else if (trimmed.length > 0 && !trimmed.startsWith('/')) {
    next = '/' + trimmed
  } else if (trimmed.length > 0) {
    next = trimmed
  } else {
    next = '/profile'
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login?error=config', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
