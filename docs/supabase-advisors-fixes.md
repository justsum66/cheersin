# Supabase Advisors 修復記錄

依 MCP `get_advisors`（security + performance）取得清單，逐項記錄與修復狀態。

## Security

### RLS Enabled No Policy（9 表）

| 表 | 狀態 | 說明 |
|----|------|------|
| public.api_calls | 待修 | RLS 已開但無 policy；建議：service_role 寫入、authenticated 可 insert 自身 user_id |
| public.certificates | 待修 | 建議：authenticated 讀寫自身 user_id |
| public.chapter_quizzes | 待修 | 建議：authenticated 讀寫自身 |
| public.game_states | 待修 | 建議：依 room 或 authenticated 讀寫 |
| public.learning_notes | 待修 | 建議：user_id = auth.uid() |
| public.payment_failures | 待修 | 建議：僅 service_role |
| public.payments | 待修 | 建議：user 讀自身、service 寫入 |
| public.promo_codes | 待修 | 建議：anon/authenticated 可 SELECT 驗證用 |
| public.user_friends | 待修 | 建議：user_id = auth.uid() |

[Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)

### Function Search Path Mutable（2 函數）

| 函數 | 狀態 | 說明 |
|------|------|------|
| public.handle_new_user | 已修 | migration: SET search_path = public |
| public.update_updated_at | 已修 | migration: SET search_path = public |

[Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

### RLS Policy Always True

| 表 | Policy | 狀態 |
|----|--------|------|
| public.ai_feedback | Allow insert for feedback API (WITH CHECK true) | 待修 | 可改為 WITH CHECK (true) 並加 rate limit 或保留（feedback 為公開提交） |

[Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy)

## Performance

### Unindexed Foreign Keys

| 表 | 外鍵 | 狀態 |
|----|------|------|
| public.api_calls | api_calls_user_id_fkey | 待修 |
| public.chat_history | chat_history_user_id_fkey | 待修 |
| public.game_sessions | game_sessions_host_user_id_fkey | 待修 |
| public.user_friends | user_friends_friend_id_fkey | 待修 |

[Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)

### Auth RLS Initialization Plan（多表）

多張表 RLS 使用 `auth.uid()` 未包成 `(select auth.uid())`，導致每行重算。建議改為 `(select auth.uid())`。  
涉及：subscriptions, quiz_results, game_sessions, learning_progress, achievements, chat_history, wine_favorites, profiles, game_rooms, game_room_players, user_achievements, chat_conversations, notifications, push_subscriptions, chapter_progress。

[Remediation](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)

### Unused Index / Duplicate Index

- 多個 idx_* 未使用：可於確認查詢不需後再考慮 DROP。
- profiles：idx_profiles_subscription 與 idx_profiles_subscription_tier 重複，保留其一。

### Multiple Permissive Policies

- wine_favorites：同一 role/action 有兩條 permissive（Users can manage own favorites、Users can view own favorites），可合併為一條。

---

**本輪**：已取得清單並記錄；實際 DDL 修復（policy 新增、search_path、index）於後續 migration 執行，避免單次變更過大。
