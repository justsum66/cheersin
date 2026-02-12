# 房間與 Game State 共用 Hook 用法（DC-15）

單一來源：避免各頁重複 fetchRoom / fetchGameState，改由 hook 統一。

## 房間取得

- **useGameRoom(slug)**  
  - 用途：取得房間基本資訊（roomId、players、hostId、expiresAt 等）、fetchRoom、error。  
  - 使用處：`party-room/page.tsx`、`script-murder` 流程、`GamesPageClient` 加入房間後。  
  - 檔案：`src/hooks/useGameRoom.ts`。

- **useRoom(slug)**  
  - 若僅需「有 slug 時拉一次房間」可包一層 useGameRoom 或共用同一 hook。

## Game State 讀寫

- **useGameState(slug, gameId)**  
  - 用途：讀寫 `game_states` 表（GET/PUT），payload 為 JSON。  
  - 使用處：派對房（party state、currentGameId、cheersCount）、劇本殺（script murder state）、UpDownStairs 房間模式。  
  - 檔案：`src/hooks/useGameState.ts`。

- **usePartyRoomState(slug)**  
  - 用途：派對房專用 state 包裝（cheersCount、currentGameId），底層呼叫 game-state API。  
  - 檔案：`src/hooks/usePartyRoomState.ts`。

- **useScriptMurderState(slug)**  
  - 用途：劇本殺專用（章節、角色、投票、懲罰），底層呼叫 game-state API。  
  - 檔案：`src/hooks/useScriptMurderState.ts`。

## 輪詢與複製邀請

- **usePolling(fn, { intervalMs, enabled })**  
  - 用途：定時重跑 fn（如 fetchRoom + refetchPartyState）。  
  - 使用處：`party-room/page.tsx`、`script-murder/page.tsx`。  
  - 檔案：`src/hooks/usePolling.ts`。

- **useCopyInvite(getUrl, onSuccess)**  
  - 用途：複製邀請連結、copied 狀態、成功 callback（toast）。  
  - 使用處：派對房、劇本殺、GamesPageClient。  
  - 檔案：`src/hooks/useCopyInvite.ts`。

## 按鈕與觸控規範（DC-10）

- **主按鈕**：`btn-primary games-focus-ring`（已含 min-h 48px、primary 色、focus 環）。  
- **次按鈕 / 邊框**：`btn-secondary games-focus-ring` 或 `btn-ghost games-focus-ring`。  
- **自訂情境色**（如乾杯 amber）：保留 `min-h-[48px]` + `games-focus-ring`，背景色可 inline。  
- 全站觸控目標 ≥44px；遊戲區建議 48px（`.games-touch-target` / `min-h-[48px]`）。

## API 對應

- GET/POST `/api/games/rooms`：建立房間、列表。  
- GET/PATCH `/api/games/rooms/[slug]`：房間詳情、更新、結束。  
- POST `/api/games/rooms/[slug]/join`：加入房間。  
- GET/PUT `/api/games/rooms/[slug]/game-state`：讀寫 game_states（game_id 由前端傳）。
