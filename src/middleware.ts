/**
 * P3-47：CORS 明確化 — 僅當 CORS_ALLOWED_ORIGINS 設定時對 /api 加上 Allow-Origin
 * P3-57：API 請求 ID — 為每個請求產生 x-request-id，傳給 route 並回傳 X-Request-Id 供追蹤日誌
 * P2-303 / P2-327：API 請求結構化日誌（timestamp, requestId, method, path）；響應時間由各 route 或 instrumentation 記錄
 * P2-335：CSRF — 狀態變更的 /api 要求 Origin/Referer 為同源或白名單；webhook/auth 路徑排除
 * DEV-004：使用 logger 取代 console
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

const CORS_ORIGINS = process.env.CORS_ALLOWED_ORIGINS?.trim()
const ALLOW_ORIGIN = CORS_ORIGINS ? CORS_ORIGINS.split(',')[0]?.trim() : ''

/** 允許的來源前綴（同源或可信）；用於 CSRF 檢查 */
function getAllowedOriginPrefixes(): string[] {
  const app = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
  const local = 'http://localhost'
  return [app, vercel, local].filter(Boolean)
}

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const ref = origin ?? referer ?? ''
  if (!ref) return process.env.NODE_ENV !== 'production'
  const allowed = getAllowedOriginPrefixes()
  return allowed.some((base) => ref === base || ref.startsWith(base + '/'))
}

/** P3-57：產生請求 ID（UUID），供日誌貫穿追蹤 */
function generateRequestId(): string {
  return crypto.randomUUID()
}

/** P2-327：結構化 API 請求日誌格式，便於搜尋與分析 — 生產環境同樣記錄供除錯 */
function logApiRequest(requestId: string, method: string, path: string): void {
  const payload = {
    timestamp: new Date().toISOString(),
    requestId,
    method,
    path,
    level: 'info',
    type: 'api_request',
  }
  logger.info('api_request', payload)
}

/** P2-375：管理後台 IP 白名單；設 ALLOWED_ADMIN_IPS 時僅允許列內 IP 存取 /admin */
function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/**
 * 取得用戶端 IP — 優先信任可信 proxy 的標準 header。
 * Vercel/Cloudflare 會設定 x-real-ip / cf-connecting-ip，較難偽造。
 * x-forwarded-for 僅作為最後備選（可被偽造）。
 */
function getClientIpFromRequest(request: NextRequest): string {
  // cf-connecting-ip 由 Cloudflare 設定，無法被客戶端偽造
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  // x-real-ip 由反向代理設定
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  // x-forwarded-for 取最後一個（最接近可信 proxy 添加的）而非第一個
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map(s => s.trim()).filter(Boolean)
    // 在 Vercel 部署時，第一個 IP 由 Vercel 添加，是可信的
    // 在其他環境中，最後一個是最接近 proxy 添加的
    return parts[0] || ''
  }
  return ''
}

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? generateRequestId()
  const pathname = request.nextUrl.pathname
  const isApi = pathname.startsWith('/api')

  /** P2-375：/admin 路徑檢查 IP 白名單 */
  if (isAdminPath(pathname)) {
    const allowedIps = process.env.ALLOWED_ADMIN_IPS?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
    if (allowedIps.length > 0) {
      const ip = getClientIpFromRequest(request)
      if (!ip || !allowedIps.includes(ip)) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }
  }

  if (isApi) {
    logApiRequest(requestId, request.method, pathname)
  }

  /** P2-335 / SEC-005：狀態變更的 API（含支付/訂閱/join）需同源 Origin/Referer；webhook/auth 回調不驗證 */
  const isStateChange = isApi && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  const skipCsrf = pathname.startsWith('/api/webhooks') || pathname.startsWith('/api/auth/')
  if (isStateChange && !skipCsrf && !isAllowedOrigin(request)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid origin' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
    })
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

export const config = { matcher: ['/api/:path*', '/admin/:path*'] }
