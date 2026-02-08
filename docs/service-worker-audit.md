# Service Worker 審計與修正（本輪）

## 已做修正

1. **CACHE_VERSION v3 → v4**
   - 強制舊客戶端取得新 SW，避免快取到已移除的 `/logo.png` 或舊靜態清單。

2. **activate 清理邏輯**
   - 原本只刪除 `k !== CACHE_NAME`，舊的 `cheersin-runtime-v3` 會一直保留。
   - 改為刪除所有非當前 `CACHE_NAME` **且** 非當前 `RUNTIME_CACHE` 的 cache，版本升級時一併清掉舊 runtime 快取。

3. **靜態清單**
   - `STATIC_URLS` 已為新路徑：`/logo_monochrome_gold.png`、`/sizes/favicon_16.png`、`/sizes/favicon_32.png`、`/sizes/android_192.png`、`/sizes/android_512.png`，無 `/logo.png`。

## 測試建議

1. **本機**：`npm run build && npm run start`，開 `http://localhost:3000`，DevTools → Application → Service Workers，確認 SW 為 v4，Cache Storage 僅見 `cheersin-v4`、`cheersin-runtime-v4`。
2. **離線**：Application → Service Workers 勾選 Offline，重新整理，首頁應出現 cached 內容或 `/offline.html` fallback。
3. **更新**：改 `CACHE_VERSION` 再 build，重新載入後舊 cache 應被刪除。

## 已知限制

- `fetch` 事件內對 navigate 請求的 fallback 為 `caches.match('/offline.html')` 或 `caches.match('/')`，需確保 `/` 或 `/offline.html` 已在 install 時被 `addAll(STATIC_URLS)` 快取。
