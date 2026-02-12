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

## 政策覆蓋檢查結果（SEC-002）

| 表 | SELECT | INSERT | UPDATE | DELETE | 備註 |
|----|--------|--------|--------|--------|------|
| profiles | 僅本人 `(select auth.uid()) = id` | 僅本人 | 僅本人 | 無（不需） | 覆蓋完整 |
| game_rooms | 任何人（列表/加入房需讀取） | host_id 本人或 NULL | 僅 host | 僅 host | 覆蓋完整 |
| game_room_players | 任何人 | 房主或本人可加入 | 房主或本人 | 房主可刪 | 覆蓋完整 |
| game_states | 房內參與者或房主（authenticated） | 同上 | 同上 | 無 | 注意：目前僅 `authenticated` 角色；匿名房若由 service_role 寫入則無礙 |

- 上述四表 RLS 已啟用，政策與 API/前端路徑對齊；無 SELECT/INSERT/UPDATE 遺漏。
- game_states 的讀寫由「房內參與者或房主」限制，角色為 `authenticated`；匿名房客若經由 API（service_role 或 RPC）寫入則不受 RLS 阻擋，依實作確認即可。

## 驗收與下一步

- [x] 對 profiles、game_rooms、game_states、game_room_players 逐表檢查：政策覆蓋所有 API 與前端路徑。
- [x] 依 Advisors 修復 ai_feedback RLS 政策：改用 `(select auth.jwt()->>'role')` 以 InitPlan 執行（見 migration `rls_ai_feedback_initplan`）。
- [x] 現狀已滿足；若未來開放匿名角色直接寫 game_states，可新增 policy 或改為 TO public 並用 WITH CHECK 限制參與者。

**關鍵檔案**：`supabase/migrations/*.sql`、Supabase Dashboard → Authentication → Policies / Table RLS。
