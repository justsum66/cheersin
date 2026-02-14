/**
 * OneSignal Create User 整合
 * POST body: { external_id: string } → 呼叫 OneSignal Create User API
 * 需設定 ONESIGNAL_APP_ID、ONESIGNAL_REST_API_KEY
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'

const APP_ID = process.env.ONESIGNAL_APP_ID?.trim()
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY?.trim()

export async function POST(request: Request) {
  if (!APP_ID || !REST_KEY) {
    return errorResponse(503, 'SERVICE_NOT_CONFIGURED', { message: 'OneSignal not configured' })
  }
  let body: { external_id?: string }
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'INVALID_JSON', { message: 'Invalid JSON' })
  }
  const externalId = typeof body.external_id === 'string' ? body.external_id.trim() : ''
  if (!externalId) {
    return errorResponse(400, 'EXTERNAL_ID_REQUIRED', { message: 'external_id required' })
  }

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
      return errorResponse(status, 'UPSTREAM_ERROR', { message: data.errors?.[0] ?? `OneSignal ${res.status}` })
    }
    return NextResponse.json({
      onesignal_id: data.identity?.onesignal_id ?? null,
      external_id: externalId,
    })
  } catch (e) {
    return errorResponse(502, 'UPSTREAM_ERROR', { message: e instanceof Error ? e.message : 'Request failed' })
  }
}
