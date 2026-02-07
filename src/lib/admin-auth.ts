/**
 * P0-04：Admin API 驗證 — 使用常數時間比較防時序攻擊
 * x-admin-secret 與 ADMIN_SECRET 比較使用 crypto.timingSafeEqual
 */
import { timingSafeEqual } from 'node:crypto'

/**
 * 驗證請求是否帶有有效的 admin secret（常數時間比較）
 * @param headerValue request.headers.get('x-admin-secret')
 * @param secret process.env.ADMIN_SECRET
 * @returns 未設 secret 時依呼叫方邏輯（如 dev 放行）；有 secret 時僅在相等且長度一致時回 true
 */
export function verifyAdminSecret(headerValue: string | null, secret: string | undefined): boolean {
  if (secret === undefined || secret === '') {
    return false
  }
  const provided = headerValue ?? ''
  if (provided.length !== secret.length) {
    // 長度不同時仍做一次固定時間比較，避免洩漏長度
    const maxLen = Math.max(secret.length, provided.length)
    const a = Buffer.alloc(maxLen, 0)
    const b = Buffer.alloc(maxLen, 0)
    a.write(secret, 0, 'utf8')
    b.write(provided.slice(0, maxLen), 0, 'utf8')
    try {
      return timingSafeEqual(a, b) && false
    } catch {
      return false
    }
  }
  const bufSecret = Buffer.from(secret, 'utf8')
  const bufProvided = Buffer.from(provided, 'utf8')
  try {
    return timingSafeEqual(bufSecret, bufProvided)
  } catch {
    return false
  }
}

/**
 * 是否應允許 admin 存取（未設 ADMIN_SECRET 時 dev 放行）
 */
export function isAdminRequest(headerValue: string | null, secret: string | undefined, isDev: boolean): boolean {
  if (secret === undefined || secret === '') {
    return isDev
  }
  return verifyAdminSecret(headerValue, secret)
}
