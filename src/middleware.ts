/**
 * P3-47：CORS 明確化 — 僅當 CORS_ALLOWED_ORIGINS 設定時對 /api 加上 Allow-Origin
 * P3-57：API 請求 ID — 為每個請求產生 x-request-id，傳給 route 並回傳 X-Request-Id 供追蹤日誌
 * P2-303 / P2-327：API 請求結構化日誌（timestamp, requestId, method, path）；響應時間由各 route 或 instrumentation 記錄
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CORS_ORIGINS = process.env.CORS_ALLOWED_ORIGINS?.trim()
const ALLOW_ORIGIN = CORS_ORIGINS ? CORS_ORIGINS.split(',')[0]?.trim() : ''

/** P3-57：產生請求 ID（UUID），供日誌貫穿追蹤 */
function generateRequestId(): string {
  return crypto.randomUUID()
}

/** P2-327：結構化 API 請求日誌格式，便於搜尋與分析 */
function logApiRequest(requestId: string, method: string, path: string): void {
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') {
    const payload = {
      timestamp: new Date().toISOString(),
      requestId,
      method,
      path,
      level: 'info',
      type: 'api_request',
    }
    console.info(JSON.stringify(payload))
  }
}

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? generateRequestId()
  const isApi = request.nextUrl.pathname.startsWith('/api')

  if (isApi) {
    logApiRequest(requestId, request.method, request.nextUrl.pathname)
  }

  let res: NextResponse
  if (isApi) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-request-id', requestId)
    res =
      request.method === 'OPTIONS' && ALLOW_ORIGIN
        ? new NextResponse(null, { status: 204 })
        : NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('X-Request-Id', requestId)
    if (ALLOW_ORIGIN) {
      res.headers.set('Access-Control-Allow-Origin', ALLOW_ORIGIN)
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-request-id')
    }
  } else {
    res = NextResponse.next()
    res.headers.set('X-Request-Id', requestId)
  }

  return res
}

export const config = { matcher: '/api/:path*' }
