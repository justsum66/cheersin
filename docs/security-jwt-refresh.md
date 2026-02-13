# SEC-009：JWT 刷新與過期處理統一

## 實作

- **createBrowserClient**：`@supabase/ssr` 的 `createBrowserClient` 會自動處理 access token 刷新與 session 續期，無需手動呼叫 `refreshSession`。
- **401 處理**：各 API 路由若回傳 401，由呼叫端（例如 `fetch` 的 catch、`useSubscription` 等）或統一 error boundary 處理；登入頁 redirect 由 middleware / auth callback 處理。
- **UserContext**：`onAuthStateChange` 訂閱 session 變更，登出或 token 失效時更新 user 狀態。

## 驗收

- 無 401 未處理：API 呼叫有 catch、錯誤訊息不洩漏敏感資訊
- 登入後長時間使用，session 自動續期（由 Supabase client 內部處理）
