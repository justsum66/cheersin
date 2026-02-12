# 派對房流程與 API（PR-45）

## 流程摘要

1. **進入 /party-room**（無 query）→ 前端自動 `POST /api/games/rooms`（body: `{ partyRoom: true }`）建立房間，成功後 `replaceState` 為 `/party-room?room={slug}`。
2. **建立後** → 顯示加入表單（建立者亦需輸入暱稱），`POST /api/games/rooms/{slug}/join` 取得 `player.id`，存於 sessionStorage 與 state（myPlayerRowId）。
3. **加入後** → 進入房內 UI（PartyRoomActive）：乾杯按鈕、邀請連結、房主選遊戲（truth-or-dare / roulette / liar-dice）。狀態由 `GET/POST /api/games/rooms/{slug}/game-state?game_id=party-room` 讀寫（PartyState：cheersCount、currentGameId）。
4. **離開** → `POST /api/games/rooms/{slug}/leave`（body: `{ playerId }`），成功後清除 sessionStorage 並導向 `/party-room`。

## 主要 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/games/rooms?list=active&limit=10 | PR-34：列出進行中派對房（未過期且 settings.partyRoom）；回傳 rooms: `{ slug, expiresAt, createdAt, playerCount }[]`。 |
| POST | /api/games/rooms | 建立房間；body: `{ partyRoom?: boolean, maxPlayers?: 4\|8\|12 }`；回傳 slug、inviteUrl、maxPlayers。免費僅能 4 人，付費可傳 4/8/12。 |
| GET | /api/games/rooms/{slug} | 取得房間與玩家列表；回傳 room（id、slug、hostId、maxPlayers、expiresAt 等）、players。 |
| POST | /api/games/rooms/{slug}/join | 加入房間；body: `{ displayName, password? }`；回傳 player.id。 |
| POST | /api/games/rooms/{slug}/leave | 離開房間；body: `{ playerId }`。 |
| GET | /api/games/rooms/{slug}/game-state?game_id=party-room | 取得派對房狀態（PartyState）。 |
| POST | /api/games/rooms/{slug}/game-state | 更新狀態；body: `{ game_id: 'party-room', payload: { cheersCount, currentGameId? } }`；PR-32 以 Zod 校驗 payload。 |

## 環境變數

- 無派對房專用必填變數；依專案既有 Supabase、NEXT_PUBLIC_APP_URL 等即可。
- 邀請連結為 `{origin}/party-room?room={slug}`。

## 相關檔案

- 頁面：`src/app/party-room/page.tsx`、`PartyRoomActive.tsx`、`PartyRoomLobby.tsx`、`PartyRoomEnded.tsx`
- Hooks：`useGameRoom`、`usePartyRoomState`、`usePartyRoomRealtime`、`useCopyInvite`
- 型別：`@/types/games`（RoomInfo、PartyState）、`@/lib/games/party-state-schema`（Zod）
