# P3-485：開發環境搭建文檔

**目標：** 新開發者約 30 分鐘內可跑起專案。

## 前置需求

- Node.js 18+
- npm 或 pnpm
- Git

## 步驟

### 1. 克隆與安裝

```bash
git clone <repo-url>
cd cheersin
npm install
```

### 2. 環境變數

複製 `.env.example` 為 `.env.local`，並填寫：

- **必填（基本運行）：**
  - `NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` — Supabase 專案
  - `GROQ_API_KEY` — AI 對話（[console.groq.com](https://console.groq.com)）

- **選填：**
  - `OPENROUTER_API_KEY` — Embedding / 備援對話
  - `PINECONE_API_KEY`、`PINECONE_API_URL` — RAG 向量
  - `PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET` — 訂閱付費

詳見 `docs/connections.md`。

### 3. 資料庫

- Supabase：在 Dashboard 建立專案後，執行 `supabase/migrations/` 內遷移（或依 Supabase 說明匯入）。
- 本地可先不配置 Pinecone/PayPal，健康檢查會標為 `not_configured`。

### 4. 啟動

```bash
npm run dev
```

瀏覽 `http://localhost:3000`。健康檢查：`http://localhost:3000/api/health`。

### 5. 驗證

- `npm run lint` — ESLint
- `npx tsc --noEmit` — TypeScript
- `npm run test:run` — 單元與煙測

## 常見問題

- **Build 失敗：** 確認 Node 版本與 `npm install` 無錯誤。
- **Supabase 連不上：** 檢查專案是否 Paused（Dashboard 喚醒）、URL/Key 是否正確。
- **PayPal 503：** 未配置時訂閱 API 會回 503，屬預期；配置後需填 `PAYPAL_WEBHOOK_ID`（生產）。
