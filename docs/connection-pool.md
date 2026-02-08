# P2-320：數據庫連接池監控

Supabase 使用 connection pooler（如 PgBouncer）；應用端為 serverless 時通常每請求短連。

- **監控**：在 Supabase Dashboard → Database → Connection pool 可查看使用量。
- **告警**：若接近上限可於 Dashboard 或外部監控設定告警；避免在應用內頻繁建立新連線（本專案已用 server 端單例 `getServerClient()`）。
