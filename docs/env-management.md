# P2-367：環境變數管理

- **Vercel**：於 Dashboard → Project → Settings → Environment Variables 設定；可區分 Production / Preview / Development。
- **本地**：使用 `.env.local`（勿提交）；`.env.example` 列出所需 key 與說明，不含真實值。
- **驗證**：`npm run validate-env`（`scripts/validate-env.mjs`）於 build/start 前檢查必要變數。

## 可選變數（未設定時優雅降級）

| 變數 | 行為 |
|------|------|
| `TRIVIA_API_KEY` | 未設定時 Trivia 使用本地題庫，`/api/trivia/questions` 回 200 + `source: 'local'`。 |
| `ONESIGNAL_APP_ID` / `ONESIGNAL_REST_API_KEY` | 未設定時 `/api/notifications/onesignal-user` 回 503，前端可隱藏推播訂閱或提示「推播未啟用」。 |
