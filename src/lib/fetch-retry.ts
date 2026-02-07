/**
 * P3-34：統一重試 — 指數退避、僅對 5xx 或網路錯誤重試
 * 供 embedding、openrouter、pinecone 等外部 fetch 使用
 */

const DEFAULT_RETRIES = 3
const DEFAULT_BACKOFF_MS = 1000
/** 可重試的 HTTP 狀態：5xx 或 429 */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

export interface FetchRetryOptions extends RequestInit {
  timeoutMs?: number
  retries?: number
  backoffMs?: number
  retryableStatuses?: Set<number>
}

function isRetryable(status: number, retryableStatuses: Set<number>): boolean {
  return retryableStatuses.has(status) || (status >= 500 && status < 600)
}

/**
 * 帶逾時與指數退避重試的 fetch；僅對 5xx/429 或網路錯誤重試
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  options: FetchRetryOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 15_000,
    retries = DEFAULT_RETRIES,
    backoffMs = DEFAULT_BACKOFF_MS,
    retryableStatuses = RETRYABLE_STATUSES,
    ...init
  } = options

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(input, {
        ...init,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const status = res.status
      if (attempt < retries && isRetryable(status, retryableStatuses)) {
        const delay = backoffMs * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      return res
    } catch (e) {
      clearTimeout(timeoutId)
      lastError = e
      const isNetworkOrAbort =
        e instanceof Error && (e.name === 'AbortError' || e.message?.includes('fetch'))
      if (attempt < retries && isNetworkOrAbort) {
        const delay = backoffMs * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw e
    }
  }
  throw lastError
}
