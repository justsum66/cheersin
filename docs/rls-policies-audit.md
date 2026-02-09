# RLS 審計（R2-014 對應）

P0 R2-014：為所有 Supabase 敏感數據表配置 RLS，用戶僅能讀寫自己的 profile、遊戲記錄、訂閱狀態。

## 審計結果（Supabase public schema）

| 表名 | RLS 已啟用 | 備註 |
|------|------------|------|
| profiles | ✅ | 用戶自身讀寫 |
| chat_history | ✅ | 依 user_id |
| chat_conversations | ✅ | 依 user_id |
| learning_progress | ✅ | 依 user_id |
| certificates | ✅ | 依 user_id |
| subscriptions | ✅ | 依 user_id |
| quiz_results | ✅ | 依 user_id |
| game_sessions | ✅ | host_user_id / room |
| game_rooms | ✅ | host_id / 房間成員 |
| game_room_players | ✅ | room_id / user_id |
| game_states | ✅ | room_id |
| learning_notes | ✅ | user_id |
| chapter_progress | ✅ | user_id |
| chapter_quizzes | ✅ | user_id |
| wine_favorites | ✅ | user_id |
| user_achievements | ✅ | user_id |
| achievements | ✅ | user_id |
| notifications | ✅ | user_id |
| push_subscriptions | ✅ | user_id |
| user_friends | ✅ | user_id |
| api_calls | ✅ | user_id 可為 null |
| ai_feedback | ✅ | 依政策 |
| promo_codes | ✅ | 讀取依政策 |
| payment_failures | ✅ | 僅 service_role 寫入 |
| subscription_audit | ✅ | 僅 service_role 存取 |
| payments | ✅ | 依政策 |
| scripts | ✅ | 讀取公開／寫入受限 |
| script_chapters | ✅ | 讀取公開 |
| script_roles | ✅ | 讀取公開 |

**結論**：所有 public 表均已啟用 RLS（rls_enabled: true）。管理員/服務角色透過 service_role key 可讀取所有數據；一般用戶僅能依 policy 存取自身資料。R2-014 已滿足。
