/**
 * E04：關鍵 API 錯誤結構化 log（不含 PII）
 * P3-57：支援 requestId 貫穿日誌；P3-58：不記錄敏感欄位（password、token 等）
 * DEV-004：改為使用 logger，避免直接 console
 */
import { logger } from './logger'
import { maskSensitiveContext } from './mask-context'

export { maskSensitiveContext }

export type ApiErrorLevel = 'error' | 'warn'

/** P0 條件：支付/訂閱寫入失敗、webhook 簽名驗證失敗等，觸發時應告警 */
export interface StructuredApiError {
  endpoint: string
  level: ApiErrorLevel
  message: string
  timestamp: string
  /** P3-57：請求 ID，供追蹤單一請求全路徑 */
  requestId?: string
  action?: string
  code?: string
  isP0?: boolean
  /** 請求處理耗時（毫秒） */
  durationMs?: number
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export type LogApiErrorOptions = {
  action?: string
  code?: string
  isP0?: boolean
  /** P3-57：從 request.headers.get('x-request-id') 傳入 */
  requestId?: string | null
  durationMs?: number
  /** PayPal webhook 錯誤時可帶 event_type 便於排查 */
  eventType?: string
}

/**
 * 寫入結構化錯誤 log；不記錄 PII 與敏感欄位；可帶 requestId 貫穿日誌。
 */
export function logApiError(
  endpoint: string,
  error: unknown,
  options: LogApiErrorOptions = {}
): void {
  const payload: StructuredApiError & { eventType?: string } = {
    endpoint,
    level: 'error',
    message: formatError(error),
    timestamp: new Date().toISOString(),
    ...(options.requestId && { requestId: options.requestId }),
    ...(options.action && { action: options.action }),
    ...(options.code && { code: options.code }),
    ...(options.isP0 && { isP0: true }),
    ...(options.durationMs != null && { durationMs: options.durationMs }),
    ...(options.eventType && { eventType: options.eventType }),
  }
  logger.error(payload.message, payload as unknown as Record<string, unknown>)
}

/**
 * 寫入結構化警告 log（非 P0）；可帶 requestId。
 */
export function logApiWarn(
  endpoint: string,
  message: string,
  options: { action?: string; code?: string; requestId?: string | null; durationMs?: number } = {}
): void {
  const payload: StructuredApiError = {
    endpoint,
    level: 'warn',
    message,
    timestamp: new Date().toISOString(),
    ...(options.requestId && { requestId: options.requestId }),
    ...(options.action && { action: options.action }),
    ...(options.durationMs != null && { durationMs: options.durationMs }),
    ...(options.code && { code: options.code }),
  }
  logger.warn(payload.message, payload as unknown as Record<string, unknown>)
}
