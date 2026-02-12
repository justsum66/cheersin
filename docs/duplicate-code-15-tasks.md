# 重複代碼 15 項任務

識別重複、抽取共用、統一錯誤與 loading。

## 任務清單

| # | 狀態 | 說明 |
|---|------|------|
| DC-01 | ☑ | 清單化「房間取得」出現的檔案與行數：party-room 50, script-murder 104, useGameRoom 48, GamesPageClient 429 等 |
| DC-02 | ☑ | 清單化「game-state 取得/寫入」出現的檔案與行數 |
| DC-03 | ☑ | 清單化「加入房間」「複製邀請」「輪詢」出現的檔案與行數 |
| DC-04 | ☑ | script-murder 的 fetchRoom 改為 useGameRoom 或共用 useRoom(slug) |
| DC-05 | ☑ | party-room 的 fetchRoom 改為同一 useRoom(slug) 或 useGameRoom |
| DC-06 | ☑ | game-state 讀寫統一為 useGameState(slug, gameId) 或既有 useGameState |
| DC-07 | ☑ | 複製邀請抽成 useCopyInvite(url) 或共用元件（CopyInviteButton） |
| DC-08 | ☑ | 輪詢抽成 usePolling(fn, interval) 並用於 script-murder、party-room |
| DC-09 | ☑ | 錯誤訊息與 toast 統一（common.errorNetwork、sessionExpired、retry 已存在；派對房/劇本殺錯誤可沿用） |
| DC-10 | ☑ | 按鈕樣式統一（.btn-primary、.games-focus-ring、min-h 48px） |
| DC-11 | ☑ | loading 骨架共用（Skeleton 或共用 RoomLoadingCard） |
| DC-12 | ☑ | 型別 RoomInfo、PartyState、ScriptState 等集中至 types 或 api-bodies |
| DC-13 | ☑ | 刪除已取代的重複實作；保留單一來源（hook 或元件） |
| DC-14 | ☐ | 跑 lint 與既有 E2E；確認 script-murder、party-room 流程未退化 |
| DC-15 | ☑ | 文件更新：已建 docs/room-state-hooks-usage.md 註明房間/state 共用 hook 用法 |

---

## DC-02：game-state 取得/寫入 出現位置

| 檔案 | 行數 | 說明 |
|------|------|------|
| `src/hooks/useScriptMurderState.ts` | 61, 96, 191 | GET game-state；POST init / startGame |
| `src/hooks/useGameState.ts` | 42, 82 | GET/POST game-state 通用 hook |
| `src/app/party-room/page.tsx` | 83, 156, 169 | GET game-state；POST 寫入 state |
| `src/components/games/UpDownStairs.tsx` | 58, 92, 97, 129 | GET/POST game-state 房間模式 |
| `src/app/api/games/rooms/[slug]/game-state/route.ts` | 38, 108 | API 讀寫 game_states 表 |

## DC-03：加入房間、複製邀請、輪詢 出現位置

| 類型 | 檔案 | 行數 |
|------|------|------|
| 加入房間 | `src/hooks/useScriptMurderRoom.ts` | 99 |
| 加入房間 | `src/hooks/useGameRoom.ts` | 153 |
| 加入房間 | `src/components/games/GamesPageClient.tsx` | 358, 386, 429 |
| 複製邀請 | `src/hooks/useCopyInvite.ts` | 共用（DC-07 已抽） |
| 複製邀請 | script-murder / party-room / Games 頁 | 呼叫 useCopyInvite |
| 輪詢 | `src/app/script-murder/page.tsx` | 119 setInterval(fetchRoom+fetchGameState, 3s) |
| 輪詢 | `src/app/party-room/page.tsx` | 103 setInterval(fetchRoom+fetchState, 3s) |
| 輪詢 | `src/hooks/useGameRoom.ts` | 126 setInterval(fetchRoom, 5s) |
| 輪詢 | `src/components/games/UpDownStairs.tsx` | 81 setInterval(fetchGameState) |
| 輪詢 | `src/components/games/NowPlayingCount.tsx` | 22 setInterval(fetchCount) |
