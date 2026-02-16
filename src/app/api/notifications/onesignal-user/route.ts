/**
 * OneSignal Create User 整合
 * POST body: { external_id: string } → 呼叫 OneSignal Create User API
 * 需設定 ONESIGNAL_APP_ID、ONESIGNAL_REST_API_KEY
 * P0-09: Zod 校驗 | P0-15: 不暴露內部錯誤 | P0-25: 限流
 */
import { NextResponse } from 'next/server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { OneSignalUserPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

const APP_ID = process.env.ONESIGNAL_APP_ID?.trim()
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY?.trim()

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'onesignal')) {
    return errorResponse(429, 'RATE_LIMITED', { message: '請求過於頻繁，請稍後再試' })
  }

  if (!APP_ID || !REST_KEY) {
    return errorResponse(503, 'SERVICE_NOT_CONFIGURED', { message: 'OneSignal not configured' })
  }

  const parsed = await zodParseBody(request, OneSignalUserPostBodySchema)
  if (!parsed.success) return parsed.response
  const { external_id: externalId } = parsed.data

  try {
    const res = await fetch(`https://api.onesignal.com/apps/${APP_ID}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${REST_KEY}`,
      },
      body: JSON.stringify({
        identity: { external_id: externalId },
        properties: {},
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const status = res.status >= 500 ? 502 : res.status
      return errorResponse(status, 'UPSTREAM_ERROR', { message: 'Upstream request failed' })
    }
    return NextResponse.json({
      onesignal_id: data.identity?.onesignal_id ?? null,
      external_id: externalId,
    })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
