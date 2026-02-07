# Lib 索引（FOLDER #6）

依用途簡要分類，便於導覽。

| 類別 | 檔案 | 說明 |
|------|------|------|
| API/請求 | api-response.ts, api-error-log.ts, fetch-retry.ts, fetch-with-timeout.ts, rate-limit.ts | 統一錯誤格式、重試、限流；DEDUP #12：對外 API 優先 fetchWithRetry 或 fetchWithTimeout |
| 訂閱 | subscription.ts, subscription-lifecycle.ts, subscription-retention.ts | 訂閱狀態與生命週期 |
| 遊戲 | games-room.ts, games-favorites.ts, games-settings.ts, games-sanitize.ts, games-weekly.ts, games-ui-constants.ts, games-last-session.ts | 房間、收藏、設定、常數 |
| 學院 | courses.ts, learn-bookmarks.ts, learn-notes.ts, learn-constants.ts, learn-terms.ts | 課程、書籤、筆記、術語 |
| 酒款/推薦 | taiwan-wines.ts, wine-response.ts, groq.ts, embedding.ts, pinecone.ts, openrouter.ts | 台灣酒資料、AI 解析、向量推薦 |
| 認證/環境 | get-current-user.ts, supabase.ts, supabase-server.ts, env.ts, env-config.ts, admin-auth.ts | 用戶、環境變數 |
| 表單/驗證 | validators.ts, scroll-to-first-error.ts, formatters.ts | 驗證、錯誤捲動、格式化 |
| 其他 | constants.ts, errors.ts, logger.ts, storage.ts, celebration.ts, deck.ts, nim.ts | 常數、日誌、儲存、小工具 |
