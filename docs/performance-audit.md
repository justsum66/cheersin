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

## PERF-011：memo/useMemo/useCallback 審計高重繪元件

- **範圍**：列表項（Lobby GameCard、learn 課程卡）、昂貴子元件（遊戲內組件）。
- **作法**：關鍵列表已用 `useMemo` 過濾/排序（如 Lobby sortedGames、visibleGames）；回調以 `useCallback` 穩定引用；可定期以 React DevTools Profiler 檢查重繪。

## PERF-014：服務端組件優先，client 僅必要處

- **原則**：能不用 `"use client"` 的頁面或區塊改為 RSC，減少 client bundle 與水合。
- **審計**：app 目錄下 page/layout 僅在需要 hooks、事件、瀏覽器 API 時使用 "use client"；列表首屏可考慮 RSC 取數、client 僅負責互動區。

## PERF-015：預載關鍵路由 link prefetch

- **Next.js**：`<Link>` 預設在 viewport 內會 prefetch；可於 next.config 調整 `experimental.staleTimes` 或維持預設。
- **可選**：對首頁 CTA（quiz、learn、games）確保使用 Next.js Link 以享有 prefetch。

## PERF-016：減少水合 payload（僅必要 state）

- **原則**：layout 與頁面避免將過多資料塞入 initial state；列表資料以 API 或 RSC 取得，client 僅持當前頁/篩選狀態。
- **現狀**：learn/games 列表已分頁或「顯示更多」，非一次注入全量。

## PERF-017：Web Vitals 持續監控與門檻告警

- **實作**：[WebVitalsReporter](src/components/WebVitalsReporter.tsx) 上報 LCP/FID/CLS 等至 `/api/analytics`；LCP > 2.5s 時寫入 sessionStorage 並 logger.warn，可擴為 Sentry 或門檻告警。
- **閾值**：可配置於環境變數或常數（如 LCP 目標 2500ms）。

## PERF-019：關鍵靜態資源 CDN/快取策略文件

- **部署**：Vercel 預設靜態資源 CDN；API 回應已於 games/rooms 等設 `Cache-Control`。
- **文件**：可於 README 或 DEPLOYMENT 註明靜態資源由 Vercel Edge 提供、關鍵 API 的 Cache-Control 策略見各 route。

## PERF-020：Bundle 分析納入 CI 或定期報告

- **可選**：`npm run build` 後可執行 `@next/bundle-analyzer` 產出報告；或於 CI 以 `ANALYZE=true` 上傳 artifact。
- **指令**：見 next.config 註解或 scripts；定期比對關鍵路徑 JS 體積。

## 已實作項目

| ID | 項目 | 實作位置 |
|----|------|----------|
| PERF-005 | React Query 快取 TTL 與 stale 一致 | `src/lib/query-client.ts` |
| PERF-006 | 長列表虛擬滾動或分頁 | learn：每等級預設顯示筆數 + 顯示更多；games：Lobby 分頁 |
| PERF-007 | 動畫 will-change/transform 僅 compositor | `src/app/globals.css` 按鈕與動畫類 |
| PERF-012 | 字體 font-display、subset | `src/app/layout.tsx` 使用 `display: 'swap'`、subsets |
| PERF-011 | memo/useMemo/useCallback 審計 | 見上 PERF-011；Lobby/learn 已用 useMemo/useCallback |
| PERF-017 | Web Vitals 門檻 | `src/components/WebVitalsReporter.tsx` LCP 2.5s 警告 |
