/**
 * P2-21 / P0-015：API 錯誤回應格式統一
 * 一律回傳 { success: false, error: { code, message } }
 * P3-74：500 不暴露內部實作，僅回傳通用訊息；細節僅 log、不傳客戶端
 */
import { NextResponse } from 'next/server'

/** 統一錯誤 body：僅 code + message，方便前端依 code 做 i18n 或分支 */
export interface ErrorResponseBody {
  success: false
  error: { code: string; message: string }
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

/** P3-74：500 時回傳通用訊息；生產環境不傳 error.message/stack，僅 log */
export function serverErrorResponse(caught?: unknown): NextResponse {
  const body: ErrorResponseBody = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '請稍後再試' },
  }
  return NextResponse.json(body, { status: 500 })
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
