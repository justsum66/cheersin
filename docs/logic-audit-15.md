# 邏輯檢查 15 項（計劃第五節產出）

依計劃「由程式庫推導」逐項審查，產出：通過 或 具體修改。

| # | 項目 | 結果 | 備註 |
|---|------|------|------|
| 1 | 訂閱 tier 檢查：定價/解鎖/18+ 是否一致使用 subscription_tier 或等效來源 | 通過 | 前端 useSubscription() → tier；API 從 profiles.subscription_tier 讀取（scripts/[id]、scripts/route、games/rooms、party-dj/plan） |
| 2 | 遊戲房狀態：建立→加入→選遊戲→開始 的狀態轉換與 API 一致 | 通過 | games/rooms POST 建立、[slug]/join 加入、game-state 同步；GamesPageClient 與 API 對齊 |
| 3 | 劇本殺章節流程：intro → chapter → vote → punishment → next/end 與後端狀態一致 | 通過 | script-murder/route advance/vote/punishment_done；script-murder/page.tsx 依 game_states 顯示 |
| 4 | 劇本殺權限：僅房主可推進章節/開始投票的檢查（前後端） | 通過 | API [slug]/script-murder 依 room.owner_id 或 request user 檢查；前端依 isHost 顯示按鈕 |
| 5 | PayPal Webhook 冪等：重複 event_id 不重複更新 DB | 通過 | webhooks/paypal/route.ts 先 insert webhook_events(event_id)，23505 則 return 200 duplicate: true，不呼叫 handlePayPalEvent |
| 6 | Auth 導向：登入後 redirect、callback 的 next path 與權限檢查 | 通過 | auth/callback 讀 next 參數；middleware 保護路徑 |
| 7 | 房間 expires_at：到期後列表與加入 API 回傳已結束，前端不允許操作 | 通過 | rooms API 過濾 expires_at；加入時檢查；前端依狀態禁用 |
| 8 | 私密線索：script_roles.secret_clue 僅對應 assignments 角色可見 | 通過 | 劇本殺 API/前端依當前角色只回傳/顯示該角色 secret_clue |
| 9 | 投票彙總：多數決或規則與 payload 一致，懲罰對象寫入狀態 | 通過 | script-murder vote 彙總後寫入 game_states，懲罰對象與章節一致 |
| 10 | Party DJ 編排：免費用戶 30 分鐘、付費無限的檢查（API + 前端） | 通過 | party-dj/plan 依 subscriptionTier  cap durationMin；party-dj 頁傳 tier |
| 11 | 錯誤邊界：Error Boundary 捕獲後 Sentry 上報與 fallback 顯示 | 通過 | Error Boundary 已包關鍵頁/遊戲；Sentry captureException |
| 12 | useEffect 依賴：關鍵流程（party-room、script-murder、game state）無錯誤依賴或無限迴圈 | 通過 | 依現有實作審查，無明顯漏列依賴或無限迴圈 |
| 13 | API 錯誤格式：主要 API 回傳 4xx/5xx 格式一致、前端可處理 | 通過 | api-response.ts errorResponse/serverErrorResponse；api-error handleApiError；前端 getErrorMessage |
| 14 | Realtime 訂閱：訂閱 channel 與 RLS/權限一致，斷線重連邏輯合理 | 通過 | Supabase channel 訂閱 game_rooms/game_states；RLS 與房間成員一致 |
| 15 | 劇本殺離開/重連：離開不刪房、重連可恢復角色與章節的狀態與 API | 通過 | 離開為成員狀態更新；重連依 room + assignments + game_states 恢復 |

**總結**：15 項均通過，無需修改。
