/**
 * P3-58 / SEC-015：敏感 key 不記錄明文，僅留前 4 字元或 [REDACTED]
 * 抽離自 api-error-log 以利 logger 與 api-error-log 共用，避免循環依賴（DEV-004）
 */
const SENSITIVE_KEYS = new Set([
  'password', 'token', 'apiKey', 'api_key', 'secret', 'authorization',
  'cookie', 'x-admin-secret', 'set-cookie', 'authorization',
  'jwt', 'access_token', 'refresh_token', 'accesstoken', 'refreshtoken',
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
