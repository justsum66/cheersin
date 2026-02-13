# 建置與部署（DEV-011）

新人可依此文件在約 30 分鐘內跑起專案並完成部署。主流程見 [README.md](../README.md) 快速開始。

## 1. 本地開發

```bash
git clone https://github.com/justsum66/cheersin.git
cd cheersin
npm install
cp .env.example .env.local
# 編輯 .env.local 填入必填變數（見 .env.example 註解）
npm run dev
```

- 預設埠：`http://localhost:3000`
- 改埠：`PORT=3099 npm run dev`

## 2. 建置與啟動

```bash
npm run build
npm start
```

`prestart` 會自動執行 `validate-env`；缺必填變數時會明確失敗。

## DEV-006：pre-commit 與 CI 跑 lint

- **pre-commit**：`.husky/pre-commit` 執行 `npx lint-staged`，對 staged 檔案跑 lint
- **CI**：`.github/workflows/ci.yml` 跑 `lint`、`test:run`、`build`、E2E

## 3. Vercel 部署

1. 將專案連到 Vercel
2. 於 Vercel 專案設定環境變數（與 `.env.example` 對應）
3. 必填：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、`GROQ_API_KEY` 或 `OPENROUTER_API_KEY`
4. 生產環境：設定 `NEXT_PUBLIC_APP_URL` 為實際網址（用於 CSRF/origin 檢查）
5. 部署：推送 main 或 `vercel` 指令

## 4. E2E 測試

```bash
# 自動啟動 dev server 於 3099（預設）
npm run test:e2e

# 若已手動啟動 dev server，可重用
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

- E2E 預設埠：3099（`PLAYWRIGHT_PORT`）
- 建議：網路不穩時可先 `npm run dev`，再指定 `PLAYWRIGHT_BASE_URL` 跑 E2E

## 5. CI 流程

`.github/workflows/ci.yml`：lint → check:i18n:all → unit tests → build → E2E

本地重現：
```bash
npm run lint && npm run check:i18n:three && npm run test:run && npm run build && npm run test:e2e
```
