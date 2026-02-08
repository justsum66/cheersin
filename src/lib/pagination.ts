/**
 * P2-310：API 分頁輔助 — 統一 cursor/offset 與回應格式
 */

export interface PaginationParams {
  /** 每頁筆數，預設 20，最大 100（API 傳入可為 string） */
  limit?: number | string
  /** offset 分頁：跳過筆數（API 傳入可為 string） */
  offset?: number | string
  /** cursor 分頁：上一頁最後一筆的 cursor（如 id 或 created_at） */
  cursor?: string
}

export interface PaginatedMeta {
  total?: number
  limit: number
  offset?: number
  nextCursor?: string | null
  hasMore: boolean
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * 解析並正規化 limit/offset，防止過大或負數
 */
export function normalizePagination(params: PaginationParams): { limit: number; offset: number } {
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || DEFAULT_LIMIT))
  const offset = Math.max(0, Number(params.offset) || 0)
  return { limit, offset }
}

/**
 * 建立分頁 meta，供 API 回傳
 */
export function buildPaginatedMeta(
  limit: number,
  offset: number,
  returned: number,
  total?: number,
  nextCursor?: string | null
): PaginatedMeta {
  const hasMore = total != null ? offset + returned < total : returned >= limit
  return {
    ...(total != null && { total }),
    limit,
    offset,
    ...(nextCursor != null && { nextCursor }),
    hasMore,
  }
}
