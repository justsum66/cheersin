/**
 * P3 / E32：訂閱挽留 — 觸發條件為取消後 RETENTION_DAYS 天內（依 cancelled_at 寫入時間）
 * 與 subscription/cancel 頁共用 key；可擴充依 end_date 算「挽留窗」至當期結束
 */
export const CANCELLED_AT_KEY = 'cheersin_subscription_cancelled_at'
export const RETENTION_DAYS = 3
const MS_PER_DAY = 24 * 60 * 60 * 1000

/** 讀取取消時間戳（ms），無或無效則 null */
export function getCancelledAt(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CANCELLED_AT_KEY)
    if (!raw) return null
    const ts = parseInt(raw, 10)
    return Number.isFinite(ts) && ts > 0 ? ts : null
  } catch {
    return null
  }
}

/** 是否在挽留期內（取消後 RETENTION_DAYS 天內） */
export function isWithinResubscribeWindow(): boolean {
  const ts = getCancelledAt()
  if (ts == null) return false
  return Date.now() - ts <= RETENTION_DAYS * MS_PER_DAY
}

/** 訂閱成功後清除取消標記，避免再顯示挽留 CTA（由 success 頁或 webhook 後前端呼叫） */
export function clearCancelledAt(): void {
  try {
    localStorage.removeItem(CANCELLED_AT_KEY)
  } catch {
    /* ignore */
  }
}
