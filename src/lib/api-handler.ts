/**
 * CLEAN-021: Standardized API error handling pattern.
 * All API routes should use these helpers for consistent JSON responses.
 *
 * Usage:
 *   import { apiSuccess, apiError, withApiErrorHandler } from '@/lib/api-handler'
 */

import { NextResponse } from 'next/server'

interface ApiErrorBody {
  ok: false
  error: { code: string; message: string; details?: unknown }
}

interface ApiSuccessBody<T = unknown> {
  ok: true
  data: T
}

/** Return a success JSON response */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ ok: true, data }, { status })
}

/** Return a structured error JSON response */
export function apiError(code: string, message: string, status = 400, details?: unknown): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(details !== undefined && { details }) } },
    { status },
  )
}

/** Common error shortcuts */
export const API_ERRORS = {
  unauthorized: () => apiError('UNAUTHORIZED', '未授權，請先登入', 401),
  forbidden: () => apiError('FORBIDDEN', '無權執行此操作', 403),
  notFound: (resource = '資源') => apiError('NOT_FOUND', `${resource}不存在`, 404),
  badRequest: (msg: string) => apiError('BAD_REQUEST', msg, 400),
  rateLimit: () => apiError('RATE_LIMITED', '請求過於頻繁，請稍後再試', 429),
  internal: (msg = '伺服器錯誤') => apiError('INTERNAL_ERROR', msg, 500),
} as const

/** Wrap an async API handler with try-catch, returns 500 on unexpected errors */
export function withApiErrorHandler(
  handler: (req: Request) => Promise<NextResponse>,
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (err) {
      console.error('[API Error]', err)
      return API_ERRORS.internal()
    }
  }
}
