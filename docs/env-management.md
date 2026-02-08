# P2-367：環境變數管理

- **Vercel**：於 Dashboard → Project → Settings → Environment Variables 設定；可區分 Production / Preview / Development。
- **本地**：使用 `.env.local`（勿提交）；`.env.example` 列出所需 key 與說明，不含真實值。
- **驗證**：`npm run validate-env`（`scripts/validate-env.mjs`）於 build/start 前檢查必要變數。
