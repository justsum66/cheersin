/**
 * E04：關鍵 API 錯誤結構化 log（不含 PII）
 * P3-57：支援 requestId 貫穿日誌；P3-58：不記錄敏感欄位（password、token 等）
 */

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
}

/** P3-58：敏感 key 不記錄明文，僅留前 4 字元或 [REDACTED] */
const SENSITIVE_KEYS = new Set([
  'password', 'token', 'apiKey', 'api_key', 'secret', 'authorization',
  'cookie', 'x-admin-secret', 'set-cookie', 'authorization'
])

function maskValue(key: string, value: unknown): unknown {
  if (value == null) return value
  const k = key.toLowerCase().replace(/-/g, '')
  if (SENSITIVE_KEYS.has(k) || k.includes('password') || k.includes('secret') || k.includes('token')) {
    const s = String(value)
    if (s.length <= 4) return '[REDACTED]'
    return s.slice(0, 4) + '***'
  }
  return value
}

/** P3-58：從 context 物件中遮罩敏感欄位，避免日誌洩漏 */
export function maskSensitiveContext<T extends Record<string, unknown>>(context: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    out[key] = maskValue(key, value)
  }
  return out
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
}

/**
 * 寫入結構化錯誤 log；不記錄 PII 與敏感欄位；可帶 requestId 貫穿日誌。
 */
export function logApiError(
  endpoint: string,
  error: unknown,
  options: LogApiErrorOptions = {}
): void {
  const payload: StructuredApiError = {
    endpoint,
    level: 'error',
    message: formatError(error),
    timestamp: new Date().toISOString(),
    ...(options.requestId && { requestId: options.requestId }),
    ...(options.action && { action: options.action }),
    ...(options.code && { code: options.code }),
    ...(options.isP0 && { isP0: true }),
  }
  console.error(JSON.stringify(payload))
}

/**
 * 寫入結構化警告 log（非 P0）；可帶 requestId。
 */
export function logApiWarn(
  endpoint: string,
  message: string,
  options: { action?: string; code?: string; requestId?: string | null } = {}
): void {
  const payload: StructuredApiError = {
    endpoint,
    level: 'warn',
    message,
    timestamp: new Date().toISOString(),
    ...(options.requestId && { requestId: options.requestId }),
    ...(options.action && { action: options.action }),
    ...(options.code && { code: options.code }),
  }
  console.warn(JSON.stringify(payload))
}
