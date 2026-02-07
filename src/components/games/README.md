# Games 模組

派對遊樂場：**27 款**精選遊戲（既有 8 款 + 新 19 款），支援**邀請玩家**（分享連結/QR、同房名單同步）。

## 結構

- **page** (`app/games/page.tsx`)：遊戲列表 + 玩家管理 modal + 房間模式（建立房間、加入房間、邀請連結/QR）+ 依選取遊戲渲染 `GameWrapper` + 子遊戲
- **Lobby**：遊戲卡牌 grid（30 張），點選進入遊戲；鍵盤導覽（Tab／Enter 選遊戲、方向鍵移動焦點）、focus-visible 環
- **GameWrapper**：標題、描述、玩家數、關閉按鈕、`GameSessionProvider` 包住子遊戲
- **GameSessionProvider**：合併 Games（玩家 + 搖晃）、傳手機、懲罰轉盤；hooks 仍為 `useGamesPlayers`、`usePassPhone`、`usePunishment`
- **GameErrorBoundary**：單一遊戲錯誤邊界，崩潰時顯示重試 UI
- **types**：`GameOption`、`GameId`（27 款 id）

## 邀請玩家與房間

- **建立房間**：點「建立房間」→ `POST /api/games/rooms` → 顯示邀請連結 + QR（api.qrserver.com）
- **加入房間**：開啟 `/games?room=<slug>` → 輸入暱稱 → `POST /api/games/rooms/[slug]/join` → 名單寫入 Supabase
- **同步**：房間內玩家每 5 秒輪詢 `GET /api/games/rooms/[slug]` 更新名單
- **Supabase**：表 `game_rooms`（id, slug, created_at）、`game_room_players`（room_id, display_name, order_index）；API 使用 service role
- **Hook**：`useGameRoom(slug)`（`hooks/useGameRoom.ts`）提供 fetchRoom、join、createRoom

## 玩家名單

- **本機**：`localStorage`（key: `cheersin_games_players`），最多 12 人；「管理玩家」modal 可新增/移除
- **房間**：來自 API，唯讀；加入狀態存於 `localStorage`（key: `cheersin_room_joined`）
- Roulette 等需玩家名單的遊戲：若在房間模式則使用房間名單，否則本機名單

## 遊戲列表（27 款）

既有 8 款：真心話大冒險、命運轉盤、酒神隨堂考、深空骰子、反應力測試、記憶翻牌、我從來沒有、國王遊戲。  
新 19 款（純數位、稽核後）：31 遊戲、上下樓梯、你喝、表面張力、倒數乾杯、隨機選一位、喝或安全、數字接龍、輪盤選人、數數字、終極密碼、比大小、浮杯、紅參遊戲、猜拳、抽籤、名字接龍、吹牛骰子、心臟病、拋硬幣、蝸牛賽車。  
已移除（不符合純數位 PWA 要求）：369（拍手在數位版僅按鈕、缺乏節奏感）、誰喝（與隨機選一位／喝或安全重複）、APT、虎克、傳瓶子、蘿蔔蹲、七的倍數、Pocky、猜歌。逐款稽核見 `research_output/games_audit_per_game_2026.md`。  
詳見 `app/games/page.tsx` 的 `games` 陣列、`research_output/asian_drinking_games_2025.md`、`research_output/games_mobile_audit_2025.md`。

## GAMES_500 遊戲內實作指引

- **#271 setRulesContent**：有規則的遊戲請使用 `<GameRules rules="..." />`，會自動呼叫 `setRulesContent` 註冊至 Wrapper 問號按鈕。
- **#272 setHasStarted**：遊戲「第一次可逆轉的玩家動作」時呼叫 `useGameProgress()?.setHasStarted(true)`（例如 Roulette 在按下轉動時）。
- **#255 觀戰者不顯示操作**：使用 `useSpectator()`，為 `true` 時隱藏主操作按鈕／表單／鍵盤快捷鍵，僅保留結果檢視（範例：Roulette）。
- **#282 按鈕 loading 不重複點擊**：載入中時 `disabled` 按鈕，並可搭配 `GAME_LOADING_BUTTON_TEXT`（`lib/games-ui-constants.ts`）顯示「載入中…」。
- **#281 列表 role list**：遊戲內列表使用 `role="list"`、子項 `role="listitem"`，可加 `.game-list` class。
- **#299 Esc 關閉 modal**：遊戲內 modal 關閉時監聽 `keydown` Escape 並呼叫關閉 callback。
- **#300 無障礙 landmark**：遊戲主內容區可加 `role="main"` 或 `.game-main`、`aria-label`。
- **#195 Space 快捷鍵**：子遊戲可透過 `useGameHotkey()?.registerSpace(fn)` 註冊 Space 觸發（下一題等），與 Wrapper 不衝突。
- **#196 數字鍵 1–9**：子遊戲可透過 `useGameHotkey()?.registerDigit(digit, fn)` 註冊 1–9 對應選項。

## 任務清單

完整任務見 `docs/GAMES_500_OPTIMIZATIONS.md`。
