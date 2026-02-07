/**
 * G194 類型安全的 localStorage 封裝
 * SSR 安全、錯誤處理、getJSON/setJSON
 */

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* quota / private mode */
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** 取得原始字串 */
export function getItem(key: string): string | null {
  return safeGetItem(key)
}

/** 寫入字串 */
export function setItem(key: string, value: string): void {
  safeSetItem(key, value)
}

/** 移除 */
export function removeItem(key: string): void {
  safeRemoveItem(key)
}

/** 取得並解析 JSON，解析失敗回傳 null */
export function getJSON<T>(key: string): T | null {
  const raw = getItem(key)
  if (raw == null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** 寫入 JSON */
export function setJSON<T>(key: string, value: T): void {
  setItem(key, JSON.stringify(value))
}
