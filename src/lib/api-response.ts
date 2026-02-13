/**
 * P2-21 / P0-015 / TEST-013：API 錯誤回應格式統一
 * 一律回傳 { success: false, error: { code, message } }；前端可依 code 做 i18n 或測試斷言
 * P3-74：500 不暴露內部實作，僅回傳通用訊息；細節僅 log、不傳客戶端
 * R2-019：serverErrorResponse 自動 log 至 logger，供日誌聚合
 */
import { NextResponse } from 'next/server'
import { logger } from './logger'

/** 統一錯誤 body：僅 code + message，方便前端依 code 做 i18n 或分支 */
export interface ErrorResponseBody {
  success: false
  error: { code: string; message: string }
}

export interface SuccessResponseBody<T = unknown> {
  success: true
  data: T
}

/**
 * 回傳統一格式的成功 JSON 與 status (預設 200)
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  const body: SuccessResponseBody<T> = {
    success: true,
    data,
  }
  return NextResponse.json(body, { status })
}

/**
 * 回傳統一格式的錯誤 JSON 與 status
 * @param status HTTP status
 * @param code 錯誤代碼（機器可讀，如 INVALID_JSON）
 * @param options.message 使用者可見訊息；未給時用 code
 */
export function errorResponse(
  status: number,
  code: string,
  options?: { message?: string }
): NextResponse {
  const body: ErrorResponseBody = {
    success: false,
    error: { code, message: options?.message ?? code },
  }
  return NextResponse.json(body, { status })
}

/** P3-74 / R2-019：500 時回傳通用訊息；自動 log 錯誤供日誌聚合 */
export function serverErrorResponse(caught?: unknown): NextResponse {
  if (caught != null) {
    const message = caught instanceof Error ? caught.message : String(caught)
    const stack = caught instanceof Error ? caught.stack : undefined
    logger.error('API serverErrorResponse', { message, stack: stack?.slice(0, 500) })
  }
  const body: ErrorResponseBody = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '請稍後再試' },
  }
  return NextResponse.json(body, { status: 500 })
}

/**
 * I18N-005 / TEST-013：從 API 回傳取出 error.code，前端可用 t(`apiErrors.${code}`) 顯示多語
 */
export function getErrorCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const err = (data as { error?: unknown }).error
  if (err != null && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') return (err as { code: string }).code
  return undefined
}

/**
 * 從 API 回傳的 JSON 取出使用者可見錯誤訊息（支援 P0-015 新格式與舊格式）
 */
export function getErrorMessage(data: unknown, fallback = ''): string {
  if (!data || typeof data !== 'object') return fallback
  const err = (data as { error?: unknown }).error
  if (err != null && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') return (err as { message: string }).message
  if (typeof err === 'string') return err
  const msg = (data as { message?: unknown }).message
  if (typeof msg === 'string') return msg
  return fallback
}
