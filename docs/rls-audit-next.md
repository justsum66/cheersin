# SEC-002：RLS 審計 — 下一批檢查

## 資料表 RLS 現況

| 表名 | RLS 啟用 | 政策摘要 | 來源 migration |
|------|----------|----------|----------------|
| profiles | ✅ | 僅本人 SELECT/UPDATE/INSERT | auth_rls_initplan |
| game_rooms | ✅ | Host 可 UPDATE/DELETE；認證可 INSERT；Anyone 可 SELECT（rl_profiles） | rls_profiles_game_rooms, auth_rls |
| game_room_players | ✅ | Host 或本人可 INSERT/UPDATE；Host 可 DELETE；Anyone 可 SELECT | rls_profiles_game_rooms, auth_rls |
| user_achievements | ✅ | 僅本人 ALL | auth_rls |
| chat_conversations | ✅ | 僅本人 ALL | auth_rls |
| notifications | ✅ | 僅本人 SELECT | notifications |
| reports | ✅ | Service role 全權 | reports |
| analytics_events | ✅ | Service role 全權 | analytics_events |
| api_calls | ✅ | Service role 全權 | api_calls |
| subscription_audit | ✅ | (依 migration 定義) | rls_subscription_audit |
| game_states | ✅ | 無細部 policy，依預設拒絕 | game_states |
| knowledge_docs | ✅ | 無細部 policy，依預設拒絕 | knowledge_docs |
| chapter_progress | ✅ | (依 learning_progress_xp) | learning_progress_xp |
| learning_notes | ✅ | (依 learning_progress_xp) | learning_progress_xp |
| certificates | ✅ | (依 learning_progress_xp) | certificates |
| ai_feedback | ✅ | 允許 insert（feedback API） | rls_ai_feedback |

## auth.uid() 優化

- `auth_rls_initplan.sql` 已將 `auth.uid()` 改為 `(select auth.uid())`，避免每行重算

## 待確認項目

- [ ] game_states：應用層是否以 service role 寫入？RLS 預設拒絕需確認
- [ ] knowledge_docs：唯讀或 admin 寫入？policy 需明確
- [ ] chapter_progress / learning_notes：需有使用者隔離 policy

## 勾選摘要

- [x] profiles、game_rooms、game_room_players 有明確政策
- [x] 敏感表（reports、analytics、api_calls）以 service role 隔離
- [ ] 學習相關表 policy 細節待補

**更新日期**：2025-02-12
