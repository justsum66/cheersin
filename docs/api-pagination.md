# P2-310：API 分頁規範

列表類 API 應支援分頁，避免一次回傳過多筆。

- **輔助模組**：`src/lib/pagination.ts` 提供 `normalizePagination`、`buildPaginatedMeta`。
- **參數**：`limit`（預設 20，最大 100）、`offset` 或 `cursor`。
- **回應格式**：`{ data: T[], meta: { limit, offset?, nextCursor?, hasMore, total? } }`。
- **範例**：`GET /api/games/rooms?limit=20&offset=0` 可改為使用此 helper 回傳 meta。
