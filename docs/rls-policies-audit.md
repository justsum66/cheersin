# RLS 政策審計 — public 表

供 SB-01 與上線前檢查使用。所有 public 表皆應啟用 RLS，且政策僅開放必要權限。

## 審計摘要

| 表名 | RLS 啟用 | SELECT | INSERT | UPDATE | DELETE | 備註 |
|------|----------|--------|--------|--------|--------|------|
| profiles | ✅ | 本人 | 本人 | 本人 | — | SB-02 已滿足 |
| subscription_audit | ✅ | 無 | 僅 service_role | — | — | 審計用，僅後端寫入 |
| webhook_events | ✅ | 僅 service_role | 僅 service_role | — | — | 冪等用，僅 webhook 寫入 |
| ai_feedback | ✅ | — | anon/authenticated | — | — | S1 已收緊：僅角色限制 + 應用層限流 |
| game_rooms | ✅ | 依政策 | 登入用戶 | 房主 | — | 見 game_room_players / game_states |
| game_room_players | ✅ | 房內可見 | 登入/房主 | 本人/房主 | — | |
| game_states | ✅ | 房主/參與者 | 房主/參與者 | 房主/參與者 | — | SB-19 已收緊 |
| game_sessions | ✅ | 本人/房主 | 房主 | 房主 | — | |
| scripts | ✅ | 公開讀 | — | — | — | SB-20 |
| script_chapters | ✅ | 公開讀 | — | — | — | |
| script_roles | ✅ | 公開讀 | — | — | — | |
| chat_history | ✅ | 本人 | 本人 | 本人 | — | SB-14 |
| chat_conversations | ✅ | 本人 | 本人 | 本人 | — | |
| learning_progress | ✅ | 本人 | 本人 | 本人 | — | SB-21 |
| chapter_progress | ✅ | 本人 | 本人 | 本人 | — | |
| certificates | ✅ | 本人 | 本人 | — | — | |
| achievements / user_achievements | ✅ | 本人 | 本人 | — | — | |
| quiz_results | ✅ | 本人 | 本人 | — | — | |
| subscriptions | ✅ | 本人 | 本人 | 本人 | — | |
| wine_favorites | ✅ | 本人 | 本人 | 本人 | 本人 | 已合併單一政策 |
| party_dj_plans | ✅ | 本人 | 本人 | 本人 | 本人 | |
| push_subscriptions | ✅ | 本人 | 本人 | 本人 | 本人 | |
| notifications | ✅ | 本人 | — | 本人 | — | 僅系統寫入 |
| api_calls | ✅ | 僅 service_role | 應用寫入 | — | — | 依應用層 |
| analytics_events | ✅ | 僅 service_role | 應用寫入 | — | — | |
| reports | ✅ | 僅 service_role | 應用寫入 | — | — | |
| knowledge_docs | ✅ | 依政策 | admin | admin | admin | Admin 知識庫 |
| learning_notes | ✅ | 本人 | 本人 | 本人 | — | |
| chapter_quizzes | ✅ | 本人 | 本人 | — | — | |
| payments / payment_failures | ✅ | 僅 service_role | 僅 service_role | — | — | |
| promo_codes | ✅ | 依政策 | 僅 service_role | — | — | |

*「本人」= `(SELECT auth.uid()) = user_id` 或對應 id 欄位；已採用 initplan 形式者以 `(select auth.uid())` 避免每行重算。*

## 變更紀錄

- 建立本審計表對應 SB-01；後續 RLS 或表新增時更新此表與對應 migration。
