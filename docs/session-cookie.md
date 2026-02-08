# P2-361：Session Cookie 安全

Supabase Auth 管理 Session；Cookie 屬性由客戶端設定決定。

- **@supabase/ssr**：在 `createServerClient` 時會設定 Cookie 的 `path`、`maxAge`；生產環境應確保使用 `Secure`、`SameSite`（通常由 Supabase 或 Next 依環境設定）。
- **檢查**：在瀏覽器 DevTools → Application → Cookies 確認 Session Cookie 具 `HttpOnly`、`Secure`（HTTPS 下）、`SameSite=Lax` 或 `Strict`。
