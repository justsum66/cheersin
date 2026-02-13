# SEC-011：SQL 參數化審計

## 摘要

本專案使用 Supabase/PostgREST，所有資料存取經由 `.from().select().insert().update().rpc()` 等 API，**無 raw SQL 字串拼接**，因此天然防 SQL injection。

## 審計範圍

- `src/app/api/**`：所有 API route 內 Supabase 呼叫
- `src/lib/*.ts`：seed、subscription-lifecycle、supabase-server 等
- `supabase/functions/**`：Edge Functions（若有 SQL）

## 審計結果

| 位置 | 查詢方式 | 參數化 | 備註 |
|------|----------|--------|------|
| 全部 API routes | `supabase.from('table').select().eq().insert()` 等 | ✅ 自動參數化 | Supabase client 將所有值透過 PostgREST 傳遞，無字串拼接 |
| `subscription-lifecycle.ts` | `supabase.from('promo_codes').select().eq()` | ✅ | 同上 |
| `supabase.rpc('activate_subscription', { ... })` | RPC 參數化 | ✅ | 參數以 JSON 傳遞 |
| Edge Functions | Supabase client 或 Postgres pool | ✅ | 若使用 `.from()` / `.rpc()` 皆參數化 |

## 注意事項

- **禁止**：使用 `supabase.raw()`、手動 `sql` 字串、或任何字串模板拼接 SQL（本專案未發現）。
- **RPC**：`activate_subscription` 等 RPC 在 migration 內定義，參數由 Supabase 安全傳遞。
- **遷移**：未來若有 raw SQL 需求，請使用 Supabase 的 `.rpc()` 或 migration 內定義的 function，切勿字串拼接。

## 勾選摘要

- [x] 無 raw SQL 字串拼接
- [x] 所有查詢經 Supabase client 參數化
- [x] RPC 調用使用參數物件

**更新日期**：2026-02-12
