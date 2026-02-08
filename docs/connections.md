# Cheersin 第三方連接：Supabase、Pinecone、PayPal

**目的：** 確保 Supabase、Pinecone、PayPal 正確配置並可被健康檢查驗證。

## 1. Supabase

- **用途：** 資料庫、Auth、Realtime、Storage。
- **環境變數：**
  - `NEXT_PUBLIC_SUPABASE_URL`：專案 URL（Dashboard → Settings → API）
  - `SUPABASE_SERVICE_ROLE_KEY`：service_role key（後端用，勿暴露前端）
- **健康檢查：** `GET /api/health` 會呼叫 `testSupabaseConnection()`，執行簡單 select。
- **未配置時：** 回傳 `not_configured`，不影響 BUILD；生產環境必須配置。

## 2. Pinecone

- **用途：** RAG 向量檢索（酒類知識、AI 助理）。
- **環境變數：**
  - `PINECONE_API_KEY`：API Key（Console → API Keys）
  - `PINECONE_API_URL`：Index 的 Host（Console → Index → Host），例如 `https://xxx.pinecone.io`
- **健康檢查：** `GET /api/health` 會呼叫 `testPineconeConnection()`（describe_index_stats 或類似）。
- **未配置時：** 回傳 `not_configured`；RAG 功能降級為僅 LLM。

## 3. PayPal

- **用途：** 訂閱付費（Basic/Premium）、Webhook 處理訂閱狀態。
- **環境變數：**
  - `PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET`：開發者後台 Application 憑證
  - `PAYPAL_WEBHOOK_ID`：生產環境必填，用於 Webhook 簽名驗證
  - `PAYPAL_BASIC_PLAN_ID`、`PAYPAL_PREMIUM_PLAN_ID`：對應方案 ID（可選，由 API 建立）
- **健康檢查：** `GET /api/health` 會以 client_credentials 向 PayPal OAuth2 要 token，驗證連通性。
- **未配置時：** 回傳 `not_configured`；訂閱 API 回傳 503。

## 驗證方式

- 本地：`curl http://localhost:3000/api/health`，檢查 `services` 陣列中各項 `status`。
- 預期：至少 3 項為 `connected` 時 `healthy: true`（建議 Supabase + Groq/OpenRouter + 其一）。
