# P2-307：數據庫觸發器

Supabase 支援 PostgreSQL triggers，可把部分邏輯放在 DB 層。

- **範例**：用戶註冊後自動建立 `profiles` 列（Supabase Auth 的 `auth.users` 可觸發 `public.profiles` insert）。
- **現有**：`game_states_updated_at_trigger` 等 migration 已有 trigger 範例。
- **建議**：審計、updated_at 自動更新等可繼續用 trigger；複雜業務邏輯仍建議放在 API 層以便測試。
