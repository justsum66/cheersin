# P2-309：軟刪除 (Soft Delete)

對核心資料使用 `deleted_at` 而非物理刪除，方便還原與審計。

- **做法**：在需軟刪的表格加 `deleted_at timestamptz`；刪除時設為 `now()`，查詢時加 `WHERE deleted_at IS NULL`。
- **RLS**：Supabase RLS 可加入 `deleted_at IS NULL` 條件，讓已刪資料對應用不可見。
- **還原**：提供 admin 或用戶「復原」時將 `deleted_at` 設回 NULL。
