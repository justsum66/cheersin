# P2-347：密碼重置流程

安全流程：用戶請求 → 發送帶一次性 Token 的郵件 → 用戶點連結設新密碼 → Token 失效。

- **Supabase**：`supabase.auth.resetPasswordForEmail(email)` 會發送重置郵件；用戶點擊後導向設定新密碼頁，Supabase 會驗證 token 並更新密碼。
- **建議**：Token 過期時間在 Supabase Dashboard 設定（預設通常 1h）；重置後舊 token 即失效，符合「僅用一次」。
