/**
 * P2-348：登入嘗試限制 — 同 IP 或同帳號（email）5 次失敗後鎖定 15 分鐘
 * 使用 in-memory Map；分散式需改用 Redis
 */

interface LoginLimitEntry {
  count: number
  resetAt: number
}

const loginLimitMap = new Map<string, LoginLimitEntry>()

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000

function getEntry(key: string): LoginLimitEntry | undefined {
  const entry = loginLimitMap.get(key)
  if (!entry) return undefined
  if (entry.resetAt < Date.now()) {
    loginLimitMap.delete(key)
    return undefined
  }
  return entry
}

function normalizeEmail(email: string | undefined): string {
  if (!email || typeof email !== 'string') return ''
  return email.trim().toLowerCase().slice(0, 256)
}

/** 記錄一次登入失敗；key 為 ip 或 email */
function recordFailure(key: string): void {
  const now = Date.now()
  const entry = loginLimitMap.get(key)
  if (!entry || entry.resetAt < now) {
    loginLimitMap.set(key, { count: 1, resetAt: now + LOCKOUT_WINDOW_MS })
    return
  }
  entry.count++
  if (entry.count >= MAX_ATTEMPTS) {
    entry.resetAt = now + LOCKOUT_WINDOW_MS
  }
}

/** 檢查是否允許登入嘗試；回傳允許與剩餘次數、解鎖時間 */
export function checkLoginLimit(ip: string, email?: string): {
  allowed: boolean
  remainingAttempts: number
  resetAt: number | null
} {
  const ipKey = `login:ip:${ip}`
  const emailKey = email ? `login:email:${normalizeEmail(email)}` : null
  const ipEntry = getEntry(ipKey)
  const emailEntry = emailKey ? getEntry(emailKey) : undefined
  const count = Math.max(ipEntry?.count ?? 0, emailEntry?.count ?? 0)
  const resetAt = ipEntry?.resetAt ?? emailEntry?.resetAt ?? null
  const allowed = count < MAX_ATTEMPTS
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - count)
  return { allowed, remainingAttempts, resetAt }
}

/** 記錄登入失敗（密碼錯誤時呼叫） */
export function recordLoginFailure(ip: string, email?: string): void {
  const ipKey = `login:ip:${ip}`
  recordFailure(ipKey)
  const normalized = normalizeEmail(email)
  if (normalized) recordFailure(`login:email:${normalized}`)
}
