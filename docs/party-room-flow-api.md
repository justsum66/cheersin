# 派對房流程與 API（PR-45）

## 流程摘要

1. **進入 /party-room**（無 query）→ 前端自動 `POST /api/games/rooms`（body: `{ partyRoom: true }`）建立房間，成功後 `replaceState` 為 `/party-room?room={slug}`。
2. **建立後** → 顯示加入表單（建立者亦需輸入暱稱），`POST /api/games/rooms/{slug}/join` 取得 `player.id`，存於 sessionStorage 與 state（myPlayerRowId）。
3. **加入後** → 進入房內 UI（PartyRoomActive）：乾杯按鈕、邀請連結、房主選遊戲（truth-or-dare / roulette / liar-dice）。狀態由 `GET/POST /api/games/rooms/{slug}/game-state?game_id=party-room` 讀寫（PartyState：cheersCount、currentGameId）。
4. **離開** → `POST /api/games/rooms/{slug}/leave`（body: `{ playerId }`），成功後清除 sessionStorage 並導向 `/party-room`。**GAME-004**：若離開者為房主，房間立即結束（`expires_at` 設為現在），所有人會看到 PartyRoomEnded；無房主移交。

## 主要 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/games/rooms?list=active&limit=10 | PR-34：列出進行中派對房（未過期且 settings.partyRoom）；回傳 rooms: `{ slug, expiresAt, createdAt, playerCount }[]`。 |
| POST | /api/games/rooms | 建立房間；body: `{ partyRoom?: boolean, maxPlayers?: 4\|8\|12 }`；回傳 slug、inviteUrl、maxPlayers。免費僅能 4 人，付費可傳 4/8/12。 |
| GET | /api/games/rooms/{slug} | 取得房間與玩家列表；回傳 room（id、slug、hostId、maxPlayers、expiresAt 等）、players。 |
| POST | /api/games/rooms/{slug}/join | 加入房間；body: `{ displayName, password? }`；回傳 player.id。 |
| POST | /api/games/rooms/{slug}/leave | 離開房間；body: `{ playerId }`。房主離開時回傳 `endRoom: true` 且房間即時過期，前端顯示 PartyRoomEnded。 |
| GET | /api/games/rooms/{slug}/game-state?game_id=party-room | 取得派對房狀態（PartyState）。 |
| POST | /api/games/rooms/{slug}/game-state | 更新狀態；body: `{ game_id: 'party-room', payload: { cheersCount, currentGameId? } }`；PR-32 以 Zod 校驗 payload。 |

## 環境變數

- 無派對房專用必填變數；依專案既有 Supabase、NEXT_PUBLIC_APP_URL 等即可。
- 邀請連結為 `{origin}/party-room?room={slug}`。

## GAME-011：派對房過期清理

- **目標**：過期房間不殘留，避免列表與資料庫膨脹。
- **實作**：Supabase Edge Function `cleanup-expired-rooms` 可定期執行（cron 或手動觸發），將 `expires_at < now()` 的房間標記或刪除；或於 API `GET /api/games/rooms?list=active` 僅回傳未過期房間（前端不顯示過期房）。
- **部署**：`npm run supabase:functions:deploy` 部署 Edge Function；cron 排程依 Supabase 專案設定（如 pg_cron 或外部 cron 呼叫 function URL）。
- **文件**：見 `docs/game-batch5-audit.md` GAME-011。

## 相關檔案

- 頁面：`src/app/party-room/page.tsx`、`PartyRoomActive.tsx`、`PartyRoomLobby.tsx`、`PartyRoomEnded.tsx`
- Hooks：`useGameRoom`、`usePartyRoomState`、`usePartyRoomRealtime`、`useCopyInvite`
- 型別：`@/types/games`（RoomInfo、PartyState）、`@/lib/games/party-state-schema`（Zod）
- 清理：Edge Function `supabase/functions/cleanup-expired-rooms`（若有）
