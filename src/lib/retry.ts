/**
 * P2-313：API 請求重試 — 短暫失敗時自動重試，避免偶發性錯誤導致 UI 報錯
 * 供關鍵 API 呼叫使用（如訂閱、健康檢查）
 */

export interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoff?: 'fixed' | 'exponential'
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 500,
  backoff: 'exponential',
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 對 fetch 結果做重試：僅在 5xx 或網絡錯誤時重試，4xx 不重試
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const { maxAttempts, delayMs, backoff } = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(input, init)
      if (res.ok || res.status < 500) return res
      lastError = new Error(`HTTP ${res.status}`)
      if (attempt === maxAttempts) return res
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (attempt === maxAttempts) throw lastError
    }
    const wait = backoff === 'exponential' ? delayMs * Math.pow(2, attempt - 1) : delayMs
    await sleep(wait)
  }
  throw lastError ?? new Error('fetchWithRetry failed')
}
