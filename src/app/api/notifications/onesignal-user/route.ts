/**
 * OneSignal Create User 整合
 * POST body: { external_id: string } → 呼叫 OneSignal Create User API
 * 需設定 ONESIGNAL_APP_ID、ONESIGNAL_REST_API_KEY
 */
import { NextResponse } from 'next/server'

const APP_ID = process.env.ONESIGNAL_APP_ID?.trim()
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY?.trim()

export async function POST(request: Request) {
  if (!APP_ID || !REST_KEY) {
    return NextResponse.json({ error: 'OneSignal not configured' }, { status: 503 })
  }
  let body: { external_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const externalId = typeof body.external_id === 'string' ? body.external_id.trim() : ''
  if (!externalId) {
    return NextResponse.json({ error: 'external_id required' }, { status: 400 })
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
      return NextResponse.json(
        { error: data.errors?.[0] ?? `OneSignal ${res.status}` },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }
    return NextResponse.json({
      onesignal_id: data.identity?.onesignal_id ?? null,
      external_id: externalId,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Request failed' },
      { status: 502 }
    )
  }
}
