# Service Worker 15 項任務

PWA / Service Worker 修復與優化清單；實作後打勾。

| # | 任務 | 狀態 |
|---|------|------|
| 1 | **版本與快取**：SW 版本號與 cache 命名一致，activate 時刪除舊版 cache | ✅ 已有（v4、CACHE_NAME/RUNTIME_CACHE、activate 清理） |
| 2 | **靜態預緩存**：install 時預緩存 offline.html、favicon、logo、必要圖標 | ✅ 已有（STATIC_URLS） |
| 3 | **導航離線 fallback**：navigate 請求離線時回傳 offline.html | ✅ 已有（fetch 最後 caches.match('/offline.html')） |
| 4 | **不緩存 API**：/api、/_next/data 不進入 cache | ✅ 已有（NO_CACHE_PATTERNS） |
| 5 | **SWR 策略**：_next/static、js/css/woff、/learn 使用 stale-while-revalidate | ✅ 已有（SWR_PATTERNS） |
| 6 | **註冊失敗靜默**：register 失敗不拋錯、不影響頁面 | ✅ 已有（.catch(() => {})） |
| 7 | **更新提示**：updatefound → 顯示「立即更新／稍後」、24h 冷卻 | ✅ 已有（PwaProvider） |
| 8 | **SKIP_WAITING**：message type SKIP_WAITING 時 skipWaiting | ✅ 已有（sw.js message） |
| 9 | **離線橫幅單一**：全站僅一處 OfflineBanner，避免重複（layout vs PwaProvider） | ✅ 本輪修復（PwaProvider 移除重複、僅 layout） |
| 10 | **Push / notificationclick**：push 顯示通知、點擊 focus 或 openWindow | ✅ 已有（sw.js push、notificationclick） |
| 11 | **開發環境可關閉**：NODE_ENV=development 或 NEXT_PUBLIC_SW_ENABLED=false 時不註冊 SW | ✅ 本輪完成 |
| 12 | **Runtime 快取上限**：runtime cache 最多保留 N 筆，避免無限成長 | ✅ 本輪完成（約 100 筆上限） |
| 13 | **無障礙**：更新提示 role=alert、aria-live；離線橫幅 role=alert/status | ✅ 已有 |
| 14 | **offline.html**：標題、重試按鈕、品牌一致；按鈕可重載 | ✅ 已有 |
| 15 | **背景同步**：sync 事件註冊標籤、可擴充 IndexedDB 重試佇列 | ✅ 已有（sync 事件、註解擴充） |

## 本輪修復摘要

- **#9**：PwaProvider 不再渲染 OfflineBanner，僅在 layout 使用 `@/components/OfflineBanner`，避免雙橫幅。
- **#11**：PwaProvider 在 `process.env.NODE_ENV === 'development'` 或 `NEXT_PUBLIC_SW_ENABLED === 'false'` 時不呼叫 `navigator.serviceWorker.register`。
- **#12**：sw.js 在 put runtime cache 前檢查 key 數量，超過上限時刪除最舊一筆（簡單 FIFO）。

---

## 繼續優化（本輪）

| 優化項 | 說明 |
|--------|------|
| **僅快取 GET** | `shouldCacheRequest()`：`method !== 'GET'` 或 `credentials === 'include'` 不進入快取，避免敏感回應被存。 |
| **僅快取 basic 回應** | `shouldCacheResponse()`：`!ok` 或 `type !== 'basic'` 不寫入 cache（避免 opaque/error 污染）。 |
| **同源嚴格比對** | 非同源改為 `url.origin !== self.location.origin`，避免子網域誤判。 |
| **Navigation Preload** | activate 時 `registration.navigationPreload.enable()`；fetch 導航請求優先使用 `event.preloadResponse`，減少首屏延遲。 |
| **Focus 檢查更新** | PwaProvider 在 `visibilitychange` → visible 時呼叫 `registration.update()`，回到分頁即可偵測新 SW。 |
| **註冊 scope** | `register(SW_URL, { scope: '/' })` 明確指定 scope。 |
| **Cleanup** | useEffect 卸載時移除 `visibilitychange` 與 `controllerchange` 監聽，避免記憶體洩漏。 |
