# 安全審計備註（SEC-011、SEC-012）

## SEC-011：SQL 參數化審計

- **範圍**：Supabase 查詢、lib 內資料庫存取。
- **結論**：專案使用 Supabase JS Client（`.from()`, `.select()`, `.insert()`, `.update()`, `.rpc()` 等），查詢條件與 payload 皆以參數傳入，無字串拼接 SQL。migrations 內為 DDL/靜態 SQL，無使用者輸入拼接。
- **驗收**：無 `raw` + 字串、無 `concat()` 組 SQL；若有新增 raw query 請一律使用參數化。

## SEC-012：檔案上傳類型與大小限制

- **實作**：`src/app/api/upload/route.ts` 已強制白名單 MIME（`image/jpeg`、`image/png`、`image/webp`）與單檔最大 5MB（`MAX_BYTES`）；非白名單類型或超檔回傳 400。
- **驗收**：白名單與大小檢查已實作；見該檔註解與常數 `ALLOWED_TYPES`、`MAX_BYTES`。
