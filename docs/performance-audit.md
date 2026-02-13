# Performance 審計備忘

## PERF-005：React Query 快取 TTL 與 stale 策略

- **實作**：`src/lib/query-client.ts` — `staleTime: 2min`、`gcTime: 5min`、`refetchOnWindowFocus: false`
- **驗收**：無過度 refetch；各頁依需求可覆寫 `staleTime`

## PERF-007：動畫使用 will-change 或 transform 僅 compositor

- **實作**：動畫盡量用 `transform`、`opacity` 以走 compositor；`will-change` 僅在動畫時使用，避免常駐
- **範例**：HomePageClient 光暈 `will-change-[opacity]` / `will-change-transform` 僅在 `!reducedMotion` 時；多數 transition 使用 `transition-transform`
- **驗收**：無 layout thrashing；避免 `width`/`height`/`top`/`left` 動畫

## PERF-009 / DEV-009：移除未使用 CSS 與 dead code

- **工具**：`npm run depcheck` 檢查未使用依賴；Tailwind purge 由 content 掃描
- **驗收**：build 無明顯浪費；depcheck 結果可接受（部分為間接依賴或 build 工具）
