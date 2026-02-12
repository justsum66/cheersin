# Supabase 使用矩陣 — API 與表對照（SB-17）

所有使用 Supabase 的 API 與對應存取表、用途。

| API 路徑 | 使用方式 | 存取表 / 儲存 | 用途 |
|----------|----------|----------------|------|
| POST /api/webhooks/paypal | createServerClientOptional | subscription_audit, profiles, subscriptions, payments, payment_failures, notifications, webhook_events | PayPal Webhook 處理、訂閱/付款/審計 |
| GET/POST /api/subscription | createServerClient | subscriptions | 訂閱查詢與建立 |
| GET/POST/DELETE /api/party-dj/plans | createServerClientOptional | party_dj_plans | 派對 DJ 方案 CRUD |
| POST /api/analytics | createServerClientOptional | analytics_events | 事件埋點 |
| GET/POST /api/games/rooms | createServerClient | game_rooms, scripts, profiles | 房間列表、建立、腳本列表 |
| GET/PATCH/DELETE /api/games/rooms/[slug] | createServerClient | game_rooms | 房間詳情、更新、結束 |
| POST /api/games/rooms/[slug]/join | createServerClient | game_rooms, game_room_players | 加入房間 |
| GET/POST /api/games/rooms/[slug]/cheers | createServerClient | game_rooms, game_states | 乾杯 |
| GET/PUT /api/games/rooms/[slug]/game-state | createServerClient | game_rooms, game_states | 遊戲狀態讀寫 |
| GET/POST /api/games/rooms/[slug]/script-murder | createServerClient | game_rooms, game_states, game_room_players | 劇本殺狀態 |
| GET /api/scripts | createServerClient | scripts, profiles | 劇本列表、訂閱檢查 |
| GET /api/scripts/[id] | createServerClient | scripts, script_chapters, script_roles, profiles | 劇本詳情與章節/角色 |
| GET /api/scripts/rooms | createServerClient | game_rooms, scripts, game_room_players | 劇本房列表 |
| GET /api/report | createServerClientOptional | reports | 檢舉寫入 |
| GET /api/learn/progress | createServerClient | chapter_progress | 學習進度 |
| GET/POST /api/learn/certificate | createServerClientOptional | certificates, chapter_progress | 證書查詢與寫入 |
| GET/POST/PATCH/DELETE /api/learn/notes | createServerClientOptional | learning_notes | 學習筆記 |
| POST /api/upload | createServerClientOptional | storage (bucket) | 檔案上傳 |
| POST /api/chat/feedback | createServerClientOptional | ai_feedback | 讚/倒讚回饋 |
| GET /api/stats/now-playing | createServerClient | game_rooms | 即時房間數 |
| GET/POST/PATCH/DELETE /api/admin/users | createServerClientOptional | profiles, subscriptions | 後台用戶管理 |
| GET/POST/PATCH/DELETE /api/admin/knowledge | createServerClient | knowledge_docs（若存在） | 知識庫 CRUD |
| lib/chat-history-persist | createServerClientOptional | chat_history | 對話持久化 |
| lib/api-usage | createServerClientOptional | api_calls | API 呼叫記錄 |
| lib/subscription-lifecycle | createServerClientOptional | profiles, subscriptions | 訂閱生命週期更新 |

*createServerClient = 必用 service role（需登入或後端）；createServerClientOptional = env 缺失時回傳 null，不拋錯。*
