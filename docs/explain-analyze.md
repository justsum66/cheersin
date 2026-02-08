# P2-329：慢查詢分析 (EXPLAIN ANALYZE)

使用 PostgreSQL 的 EXPLAIN ANALYZE 可檢視查詢執行計劃與實際耗時。

- **Supabase**：Dashboard → SQL Editor 執行 `EXPLAIN (ANALYZE, BUFFERS) SELECT ...`。
- **重點**：檢視 Seq Scan vs Index Scan、實際時間、buffers；若 Seq Scan 過多可為常用條件加索引。
- **本專案**：migrations 已為 game_rooms、subscriptions 等表加常用索引；新增查詢時可先 EXPLAIN 再上線。
