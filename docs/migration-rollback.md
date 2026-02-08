# P2-317：數據庫遷移回滾

Supabase 遷移為前向執行，回滾需手動撰寫反向遷移。

- **做法**：每支遷移檔（如 `20260202110000_webhook_events_idempotency.sql`）可對應一支 `down` 檔（如同目錄下 `..._rollback.sql` 或命名規範 `*_down.sql`），內容為對應的 `DROP TABLE` / `ALTER TABLE` 還原。
- **執行**：不在 Supabase CLI 預設流程內，需手動在 Dashboard SQL Editor 或 `supabase db execute` 執行 down 腳本。
- **建議**：遷移前在預覽環境先跑一次，確認無誤再上生產。
