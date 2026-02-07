/**
 * E53：API 逾時與可選重試
 * fetch 設 timeout（預設 30s）；GET 可重試 1 次；失敗時拋錯或回傳 null，前端顯示「請稍後再試」
 */

const DEFAULT_TIMEOUT_MS = 30000

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number
  retryOnce?: boolean
}

/**
 * 帶逾時的 fetch；逾時時 abort 並拋錯
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retryOnce = false, ...init } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(input, { ...init, signal: controller.signal })
    clearTimeout(timeoutId)
    return res
  } catch (e) {
    clearTimeout(timeoutId)
    if (retryOnce && (e instanceof Error && e.name === 'AbortError')) {
      return fetchWithTimeout(input, { ...options, retryOnce: false })
    }
    throw e
  }
}
