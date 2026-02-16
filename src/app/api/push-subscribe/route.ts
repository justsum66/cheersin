/**
 * PWA.3：儲存 Web Push 訂閱，供後端發送推播
 * POST body: { subscription: PushSubscriptionJSON }
 * P0-03: Zod 校驗 | P0-22: 限流
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { normalizeEnv, normalizeUrl } from '@/lib/env'
import { PushSubscribePostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'push_subscribe')) {
    return errorResponse(429, 'RATE_LIMITED', { message: '請求過於頻繁，請稍後再試' })
  }

  try {
    const parsed = await zodParseBody(request, PushSubscribePostBodySchema)
    if (!parsed.success) return parsed.response

    const { subscription } = parsed.data
    const endpoint = subscription.endpoint
    const p256dh = subscription.keys.p256dh
    const auth = subscription.keys.auth

    const user = await getCurrentUser()
    const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabaseAnonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse(503, 'Config', { message: '服務未設定' })
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

    const { error } = await supabase.from('push_subscriptions').upsert(
      { endpoint, p256dh, auth, user_id: user?.id ?? null },
      { onConflict: 'endpoint', ignoreDuplicates: false }
    )
    if (error) {
      return serverErrorResponse(error)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
