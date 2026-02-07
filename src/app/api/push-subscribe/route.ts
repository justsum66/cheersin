/**
 * PWA.3：儲存 Web Push 訂閱，供後端發送推播
 * POST body: { subscription: PushSubscriptionJSON }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { normalizeEnv, normalizeUrl } from '@/lib/env'

const MAX_ENDPOINT_LENGTH = 2048
const MAX_KEY_LENGTH = 256

export async function POST(request: NextRequest) {
  try {
    let body: { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } }
    try {
      body = await request.json()
    } catch {
      return errorResponse(400, 'Invalid JSON', { message: '請提供有效的 JSON body' })
    }
    const sub = body?.subscription
    if (!sub?.endpoint || typeof sub.endpoint !== 'string') {
      return errorResponse(400, 'Missing subscription', { message: 'subscription.endpoint 必填' })
    }
    const p256dh = sub.keys?.p256dh && typeof sub.keys.p256dh === 'string' ? sub.keys.p256dh.slice(0, MAX_KEY_LENGTH) : ''
    const auth = sub.keys?.auth && typeof sub.keys.auth === 'string' ? sub.keys.auth.slice(0, MAX_KEY_LENGTH) : ''
    if (!p256dh || !auth) {
      return errorResponse(400, 'Missing keys', { message: 'subscription.keys.p256dh 與 keys.auth 必填' })
    }
    const endpoint = sub.endpoint.slice(0, MAX_ENDPOINT_LENGTH)

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
      return errorResponse(500, 'Insert failed', { message: '無法儲存訂閱' })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
