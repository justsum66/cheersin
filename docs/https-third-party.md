# P2-365：第三方 API 使用 HTTPS

所有對外 API 呼叫應使用 HTTPS 並驗證憑證。

- **Node**：`fetch` 與 `https` 預設會驗證 TLS；勿設定 `NODE_TLS_REJECT_UNAUTHORIZED=0`（除本地除錯）。
- **本專案**：Groq、OpenRouter、PayPal、Supabase 等皆以 https URL 呼叫；金鑰僅存環境變數，不寫入程式碼。
