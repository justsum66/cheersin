# Performance 審計備忘

## PERF-001：Bundle 拆分測量

- **指令**：`npm run analyze` 或 `ANALYZE=true npm run build`
- **產出**：`.next/analyze/` 內 client/server 報告
- **next.config**：已有 splitChunks（vendor-react、vendor-next、vendor-supabase、vendor-ui、vendor-icons、vendor-other）
- **填表**（請依實際 build 結果更新）：

| Chunk | 預期 | 備註 |
|-------|------|------|
| vendor-react | <150KB | React 核心 |
| vendor-next | <200KB | Next 框架 |
| vendor-supabase | <100KB | Auth/DB |
| vendor-ui | <150KB | framer-motion, lottie |
| vendor-icons | <100KB | lucide-react（optimizePackageImports） |
| 首屏 page | <200KB | 關鍵頁 LCP |

## PERF-002：LCP/CLS 測量

- **工具**：Lighthouse（Chrome DevTools 或 `npx lighthouse`）
- **環境**：`npm run build && npm run start`，生產模式
- **填表**（請依實際測量更新）：

| 頁面 | LCP (s) | CLS | FID (ms) | 備註 |
|------|---------|-----|----------|------|
| / | - | - | - | 首頁 |
| /games | - | - | - | 遊戲列表 |
| /learn | - | - | - | 課程列表 |
| /party-room | - | - | - | 派對房 |

**目標**：LCP <2.5s，CLS <0.1

## PERF-006：長列表分頁或虛擬滾動

- **範圍**：learn 課程列表、games Lobby 遊戲卡
- **現況**：Lobby ~50 款遊戲，learn ~15 課程；尚未達 100+ DOM 瓶頸
- **建議**：若遊戲/課程數增至 100+，可採用 `react-window` 虛擬滾動或分頁
- **GAME-017**：GameLazyMap 已 lazy load + PrefetchOnVisible，卡片進入視窗時 prefetch，減少首屏負載

## PERF-010：關鍵 API 延遲優化

- **api/games**：create/join/game-state 有 rate limit，避免 DDoS
- **api/learn**：progress、notes 為 CRUD，可考慮 Redis 快取熱門課程
- **api/chat**：streaming 回應，逾時 30s；可考慮 edge function 降低 latency
- **註解**：關鍵路徑已於 route 內註明；大流量時可加 Redis cache

## PERF-011：memo 審計高重繪元件

- **GameCard**：已使用 `memo()`，避免 Lobby 篩選時全量重繪
- **LearnCourseContent**：章節列表可考慮 `memo` 章節項
- **Lobby**：PrefetchOnVisible 包裝卡片，IntersectionObserver 減輕開銷

## PERF-012：字體載入策略

- **layout**：next/font `display: 'swap'` 避免 FOIT（Flash of Invisible Text）
- **globals.css**：--font-display、--font-sans 由 layout 注入
- **驗收**：無 FOIT；fallback 為 system-ui

---

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
