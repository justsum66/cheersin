/**
 * 簡易 Rate Limiting：基於 IP 或識別碼的請求限流
 * 使用 in-memory Map（適用於單一實例；分散式需用 Redis）
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limitMap = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  /** 時間窗口（毫秒），預設 60000 (1 分鐘) */
  windowMs?: number
  /** 允許的最大請求數，預設 60 */
  max?: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * 檢查並記錄請求
 * @param identifier - 識別碼（如 IP、user ID）
 * @param config - 限流配置
 * @returns 是否允許請求 + 剩餘次數
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { windowMs = 60000, max = 60 } = config
  const now = Date.now()
  
  const entry = limitMap.get(identifier)
  
  // 清理過期條目（可選，避免 Map 無限增長）
  if (limitMap.size > 10000) {
    const keysToDelete: string[] = []
    limitMap.forEach((val, key) => {
      if (val.resetAt < now) keysToDelete.push(key)
    })
    keysToDelete.forEach((key) => limitMap.delete(key))
  }
  
  if (!entry || entry.resetAt < now) {
    // 新窗口或過期，重置
    limitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, limit: max, remaining: max - 1, resetAt: now + windowMs }
  }
  
  if (entry.count >= max) {
    // 超過限制
    return { success: false, limit: max, remaining: 0, resetAt: entry.resetAt }
  }
  
  // 在限制內，計數 +1
  entry.count++
  return { success: true, limit: max, remaining: max - entry.count, resetAt: entry.resetAt }
}

/**
 * 從 Request headers 取得客戶端 IP（考慮代理）
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * 簡化的限流檢查函式（向後兼容）
 * @param identifier - 識別碼（如 IP、user ID）
 * @param context - 上下文（用於決定限流配置）
 * @returns 是否被限流
 */
/** SEC-001：公開/高頻 API 限流 context；subscription/upload 從嚴 */
export function isRateLimited(identifier: string, context: string): boolean {
  const config: RateLimitConfig = {
    windowMs: 60000, // 1 分鐘
    max:
      context === 'create' ? 10
      : context === 'join' || context === 'game_state' ? 30
      : context === 'subscription' ? 20
      : context === 'upload' ? 15
      : 60,
  }
  const result = checkRateLimit(identifier, config)
  return !result.success
}
