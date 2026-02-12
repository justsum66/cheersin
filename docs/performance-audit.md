# 效能審計檢查清單（PERF）

本文件對應 TASKS-170 Phase 2 效能相關任務，供定期檢視與測量。

## PERF-009：移除未使用 CSS 與 dead code

- **Tailwind**：建置時 Tailwind 僅產出使用到的 class；可定期執行 `npm run build` 檢視 `/.next/static/css` 體積。
- **Dead code**：移除未引用的元件與樣式；可搭配 `ts-prune` 或 IDE 未使用符號檢查。
- **建議**：每次大功能上線前跑一次 build，比對前次 bundle 大小。

## PERF-010：關鍵 API 延遲 < 500ms

- **型態**：可審計型；需實測或監控。
- **作法**：關鍵路徑（登入、訂閱、派對房 join、game-state）可透過 Web Vitals、Sentry 或自建 API 監控測量 P95 延遲。
- **目標**：關鍵 API P95 < 500ms；若超標則優化查詢（索引、N+1）、快取或 CDN。

## 已實作項目

| ID | 項目 | 實作位置 |
|----|------|----------|
| PERF-005 | React Query 快取 TTL 與 stale 一致 | `src/lib/query-client.ts` |
| PERF-006 | 長列表虛擬滾動或分頁 | learn：每等級預設顯示筆數 + 顯示更多；games：Lobby 分頁 |
| PERF-007 | 動畫 will-change/transform 僅 compositor | `src/app/globals.css` 按鈕與動畫類 |
| PERF-012 | 字體 font-display、subset | `src/app/layout.tsx` 使用 `display: 'swap'`、subsets |
