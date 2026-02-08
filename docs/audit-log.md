# P2-323：數據庫審計日誌

對核心表（如 subscriptions、profiles）記錄變更可支援合規與除錯。

- **做法**：新增 `audit_log` 表（user_id, table_name, row_id, action, old_data, new_data, created_at），並以 trigger 或應用層在 INSERT/UPDATE/DELETE 時寫入。
- **PII**：old_data/new_data 可僅存必要欄位並脫敏，避免日誌洩漏個資。
- **查詢**：可依 table_name、user_id、時間範圍查詢變更歷史。
