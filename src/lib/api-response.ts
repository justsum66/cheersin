/**
 * P2-21：API 錯誤回應格式統一
 * P3-74：500 不暴露內部實作，僅回傳通用訊息；細節僅 log、不傳客戶端
 */
import { NextResponse } from 'next/server'

export interface ErrorResponseBody {
  error: string
  code?: string
  message?: string
  details?: unknown
}

/**
 * 回傳統一格式的錯誤 JSON 與 status
 */
export function errorResponse(
  status: number,
  error: string,
  options?: { code?: string; message?: string; details?: unknown }
): NextResponse {
  const body: ErrorResponseBody = { error }
  if (options?.code) body.code = options.code
  if (options?.message) body.message = options.message
  if (options?.details !== undefined) body.details = options.details
  return NextResponse.json(body, { status })
}

/** P3-74：500 時回傳通用訊息；生產環境不傳 error.message/stack，僅 NODE_ENV !== 'production' 可選傳 details */
export function serverErrorResponse(caught?: unknown): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'
  const body: ErrorResponseBody = { error: 'Internal server error', message: '請稍後再試' }
  if (!isProd && caught instanceof Error) body.details = caught.message
  return NextResponse.json(body, { status: 500 })
}
