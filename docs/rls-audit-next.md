# RLS 審計與下一步（SEC-002）

對應 TASKS-170 SEC-002：profiles / game_rooms / game_states 政策完整。本文件記錄審計結果與 Advisors 建議。

## 當前 RLS 狀態（Supabase 專案）

| 表名 | RLS 啟用 | 說明 |
|------|----------|------|
| profiles | 是 | 需確認 SELECT/INSERT/UPDATE 政策涵蓋 API 與 auth 流程 |
| game_rooms | 是 | 需確認匿名加入、房主、list 查詢政策 |
| game_room_players | 是 | 需確認 join/leave 與 host 判定 |
| game_states | 是 | 需確認 room 維度讀寫政策 |

## Supabase Advisors 對照

- **Security**：目前無 security 類 lints 回報；RLS 已啟用於上述表。
- **Performance**：`auth_rls_initplan` — 表 `public.ai_feedback` 政策「Allow insert for feedback API」內使用 `auth.<function>()` 逐 row 重算，建議改為 `(select auth.uid())` 等以 InitPlan 執行。修復：見 [Supabase RLS 文件](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)。
- **Unused indexes**：Advisors 回報多筆未使用索引（如 idx_profiles_zodiac、idx_game_rooms_slug 等）；可依查詢模式決定保留或移除，非本批必要。

## 驗收與下一步

- [ ] 對 profiles、game_rooms、game_states 逐表檢查：SELECT/INSERT/UPDATE 政策是否覆蓋所有 API 與前端路徑，無遺漏或過寬。
- [ ] 依 Advisors 修復 ai_feedback RLS 政策（改用 `(select auth.uid())` 等）。
- [ ] 必要時產出 migration 於 `supabase/migrations/` 並套用。

**關鍵檔案**：`supabase/migrations/*.sql`、Supabase Dashboard → Authentication → Policies / Table RLS。
