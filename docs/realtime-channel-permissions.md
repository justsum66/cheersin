# P2-285：Supabase Realtime 頻道權限

遊戲房間的 Realtime 頻道應僅允許房間內玩家訂閱與廣播，防止未授權竊聽或干擾。

## 實作要點

1. **頻道命名**
   - 使用固定前綴 + `room_id`（或 `slug`），例如：`room:${roomId}` 或 `game:${slug}`。
   - 避免可猜測的順序 ID，必要時用 UUID。

2. **權限控制**
   - **RLS**：在 `realtime` 的 `broadcast` / `presence` 或對應表上，透過 RLS 限制僅 `room_id` 對應的參與者能 INSERT/UPDATE。
   - **Server 驗證**：在 `game-state` 等 API 寫入前，驗證請求者為該房間的玩家（見 `api/games/rooms/[slug]/join`、`game-state` route）。
   - **Channel 訂閱**：客戶端僅在成功 join 房間後才訂閱該房間頻道；後端 join API 已驗證身份。

3. **Supabase 設定**
   - Dashboard → Database → Realtime：確認僅開放需要的表或使用 Realtime 的 Broadcast/Presence。
   - 若使用 Realtime 的 Postgres Changes，需在該表上設定 RLS，使僅授權用戶能收到變更。

4. **相關檔案**
   - `lib/supabase-server.ts`、`lib/supabase.ts`：建立 Realtime 客戶端時使用相同 anon key，權限依 RLS 與 server 端 join 邏輯。
   - `app/api/games/rooms/[slug]/join/route.ts`：加入房間後再訂閱頻道。
   - `app/api/games/rooms/[slug]/game-state/route.ts`：寫入前驗證為房間玩家。
