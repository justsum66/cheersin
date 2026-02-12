# 效能審計檢查清單（PERF）

本文件對應 TASKS-170 Phase 2 效能相關任務，供定期檢視與測量。

## PERF-001：關鍵路徑 bundle < 200KB

- **目標**：首頁與 games 等關鍵路徑 First Load JS < 200KB（單一路由）。
- **測量**：執行 `npm run analyze`（即 `ANALYZE=true next build`），建置完成後檢視產出的 bundle 報告；或 `next build` 終端輸出中的「First Load JS」欄位。
- **如何解讀與填表**：建置完成後，終端會列出各路由的 First Load JS（單位 KB）；或開啟 `@next/bundle-analyzer` 產出的 HTML 報告，依路由對應的 chunk 加總。將數值填入下表「First Load JS」欄，並填寫測量日期；若未執行 analyze 可留空並註明「待測量」。
- **記錄**：將首頁（/）、/games、/learn、/quiz 等 First Load JS 記於下方，並標註測量日期。
- **若超標**：規劃 dynamic import 拆 chunk、延遲載入非首屏元件、或將重型庫改為動態 import。

| 路由 | First Load JS | 測量日期 |
|------|----------------|----------|
| / | 516 kB | 2026-02-12 |
| /games | 424 kB | 2026-02-12 |
| /learn | 529 kB | 2026-02-12 |
| /quiz | 562 kB | 2026-02-12 |

**備註**：上述為 `npm run analyze` 單次測量；關鍵路徑皆 > 200KB（shared 約 546 kB），超標時以 dynamic import 拆 chunk、延遲非首屏元件。**PERF-001 檢查**：建置後比對關鍵路徑 < 200KB；超標時以 dynamic import 拆 chunk、延遲非首屏元件。

## PERF-002：LCP / INP / CLS 達標

- **目標**：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1（Core Web Vitals 良好門檻）。
- **測量**：Lighthouse（DevTools > Lighthouse）或實機 Web Vitals（WebVitalsReporter 上報至 /api/analytics）；可對關鍵頁（首頁、quiz、games、learn）跑 Lighthouse 並記錄。
- **Lighthouse 測量步驟**：Chrome DevTools > Lighthouse > 選擇 Performance（與 Accessibility 可一併勾選）> 裝置選 Mobile 或 Desktop > Analyze page load。結果中的「Largest Contentful Paint」「Cumulative Layout Shift」對應 LCP、CLS；INP 可從「Total Blocking Time」或實機 Web Vitals 取得。將數值填入下表並註明測量日期；若未跑可留空並註明「待測量」。
- **記錄**：結果寫入下方表格；若未達標則標註並規劃優化（圖片優先級、字體、layout shift 來源）。

| 頁面 | LCP | INP | CLS | 測量日期 |
|------|-----|-----|-----|----------|
| 首頁 | 待測量 | 待測量 | 待測量 | — |
| /games | 待測量 | 待測量 | 待測量 | — |
| /quiz | 待測量 | 待測量 | 待測量 | — |
| /learn | 待測量 | 待測量 | 待測量 | — |

**PERF-002 目標**：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1；WebVitalsReporter 已上報至 /api/analytics。

## PERF-003：遊戲元件懶加載

- **實作**：`GameLazyMap` 以動態 import 載入各遊戲元件；Lobby 為 `lazy(() => import('@/components/games/Lobby'))`；非首屏遊戲不一次載入。見 `src/components/games/GameLazyMap.tsx`、`GamesPageClient.tsx`。
- **驗收**：無首屏載入全部遊戲；建置後關鍵路徑 JS 可控。

## PERF-008：API 回應壓縮與快取頭

- **實作**：next.config 靜態資源（圖片、`_next/static`）已設 `Cache-Control: public, max-age=31536000, immutable`；games/rooms 等 API 可於各 route 回傳 `Cache-Control`（見 SEC-008 等 route 註解）。
- **驗收**：靜態可快取；列表/API 依需求設 short stale 或 no-store。

## PERF-013：第三方腳本延遲或 async

- **實作**：Sentry、Turnstile 使用 `next/script` 或動態載入；Turnstile 元件為 dynamic import（見登入/忘記密碼頁）。分析腳本不阻塞主線程。
- **驗收**：關鍵第三方以 async/defer 或 lazy 載入；可於 layout 或元件註解標註。

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
- **驗收**：[ ] 新 page/layout 預設為 RSC，僅必要互動處加 "use client"；[ ] 列表/靜態區以 RSC 取數為優先；[ ] 定期檢視 app 樹中 client 邊界數量。**現狀**：app 樹多為動態頁（ƒ），client 邊界集中於互動頁（login、quiz、games、learn、party-room 等）；靜態/SSG 僅部分路由（○/●）。

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

- **部署**：靜態資源（`_next/static`、圖片、字體等）由 Vercel Edge/CDN 提供；next.config 已設靜態 `Cache-Control: public, max-age=31536000, immutable`。
- **API**：關鍵 API 的 Cache-Control 由各 route 自行回傳（如 games/rooms 等），見各 route 註解；無統一頭時為 no-store。
- **文件**：README 或本文件已註明上述策略；詳見 PERF-008。

## PERF-020：Bundle 分析納入 CI 或定期報告

- **指令**：`npm run analyze`（即 `ANALYZE=true next build`）產出 bundle 報告；建置完成後於 `.next` 或產出目錄檢視。
- **CI 可選**：CI 中可設 `ANALYZE=true` 執行 build 並上傳產出 artifact，供定期比對關鍵路徑 JS 體積；與 PERF-001 表格對齊使用。
- **驗收**：定期執行 `npm run analyze` 或 CI artifact 檢視 First Load JS；超標時依 PERF-001 優化。

## 已實作項目

| ID | 項目 | 實作位置 |
|----|------|----------|
| PERF-005 | React Query 快取 TTL 與 stale 一致 | `src/lib/query-client.ts` |
| PERF-006 | 長列表虛擬滾動或分頁 | learn：每等級預設顯示筆數 + 顯示更多；games：Lobby 分頁 |
| PERF-007 | 動畫 will-change/transform 僅 compositor | `src/app/globals.css` 按鈕與動畫類 |
| PERF-012 | 字體 font-display、subset | `src/app/layout.tsx` 使用 `display: 'swap'`、subsets |
| PERF-011 | memo/useMemo/useCallback 審計 | 見上 PERF-011；Lobby/learn 已用 useMemo/useCallback |
| PERF-017 | Web Vitals 門檻 | `src/components/WebVitalsReporter.tsx` LCP 2.5s 警告 |
| PERF-014 | RSC 優先、client 邊界審計 | 見上 PERF-014 節；app 樹 client 邊界集中於互動頁 |
| PERF-019 | 靜態 CDN/快取策略文件 | 見上 PERF-019；next.config 靜態 Cache-Control、README 註明 |
| PERF-020 | Bundle 分析定期報告 | `npm run analyze`；見上 PERF-020 與 PERF-001 表格 |
