# PWA 優化任務（P2-227 / P3-431）

## 現狀

- **public/sw.js**：已實作 install/activate/fetch；靜態資源 cache-first；`_next/static`、js/css/font 與部分路徑 SWR；其餘 network-first + 離線 fallback 至 `/offline.html`；push/notificationclick/sync 已接。
- **manifest**：`app/manifest.ts` 提供 name、short_name、icons、shortcuts、screenshots。
- **PwaProvider**：註冊 SW、添加到主畫面橫幅、更新提示。
- **OfflineBanner**：離線時頂部橫幅。

## P2-227：Service Worker 緩存策略

- 靜態資源：Cache First（`STATIC_URLS`）。
- `_next/static`、js/css/woff：Stale-While-Revalidate（`RUNTIME_CACHE`）。
- API：預設不緩存（`NO_CACHE_PATTERNS` 含 `/api/`）；若未來新增 GET 遊戲列表 API，可對該路徑放行並設短 TTL SWR。
- 導航請求：network-first，失敗時回傳 `/offline.html` 或 `/`。

## P3-431：離線學習

- 課程頁面（`/learn`、`/learn/[courseId]`）為動態 HTML，目前採 network-first；離線時若曾造訪過可由 RUNTIME_CACHE 回傳。
- 建議：用戶進入課程後，SW 已對該次請求做 runtime cache，下次離線可讀取；若要強化「離線可學」，可於課程頁載入完成後主動 cache 該頁 URL（如 `caches.open(RUNTIME_CACHE).then(c => c.add(request.url))`），或於 build 時預先將關鍵課程路徑列入 precache（需與 Next 產出路徑對齊）。

## 版本

- SW 版本由 `CACHE_VERSION` 控制， bump 後舊 cache 會在 activate 時清除。
