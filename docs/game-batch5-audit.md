# Game Batch 5 審計（GAME-001, 002, 004～009, 010～022）

對應計畫「下一批 70 任務」Batch 5 與「下一批任務實作計畫」Batch 3。

## GAME-004：房主離開時房間處置（移交或結束）明確

- **狀態**：已實作。`POST /api/games/rooms/[slug]/leave` 若離開者為房主（player.user_id === room.host_id），將房間 `expires_at` 設為現在，回傳 `endRoom: true`；前端 `isRoomEnded` 觸發後顯示 PartyRoomEnded。無房主移交。
- **驗收**：文件見 `docs/party-room-flow-api.md`；實作與文件一致。

## GAME-005：邀請連結複製與分享文案正確

- **狀態**：已實作。`useCopyInvite` 供 party-room、script-murder 使用；PartyRoomActive 使用 `partyRoom.inviteLink`、`partyRoom.copyInviteAria`、`common.copied`；script-murder 使用 `scriptMurder.copyInvite`、`scriptMurder.copied`。i18n 已涵蓋。
- **驗收**：可複製且文案可讀。

## GAME-006：乾杯/遊戲切換即時反映給所有成員

- **狀態**：已實作。game-state 經 POST 寫入；前端 `usePolling(refetchRoomAndState, 2000)` 改為 2s 輪詢，搭配 usePartyRoomRealtime（game_rooms）確保無延遲 >2s。
- **驗收**：乾杯/遊戲切換於 2s 內反映。

## GAME-007：真心話大冒險/輪盤/骰子在房內可選可玩

- **狀態**：已實作。PartyRoomActive 房主可選 truth-or-dare、roulette、liar-dice；「先去派對遊樂場」連結至 `/games?room={slug}`，「繼續遊戲」連結至 `/games?room={slug}&game={currentGameId}`。
- **驗收**：流程完整，房內可選可玩。

## GAME-008：遊戲結束與返回大廳狀態清晰

- **狀態**：派對房結束由 PartyRoomEnded 顯示本局統計、「建立新房間」「返回大廳」；遊戲頁從 party-room 進入時以 room 參數維持房間脈絡，返回派對房可經導航或「繼續遊戲」連結。各遊戲元件有結束狀態與返回（依既有 GamesPageClient Lobby 流程）。
- **驗收**：有按鈕或引導返回大廳/派對房。

## GAME-009：劇本殺角色分配與劇本載入無錯

- **狀態**：已實作。`useScriptMurderState.startGame` 以 `scriptDetail.roles` 與 `players` 做 1:1 隨機分配（assignments[playerId]=roleId）；劇本由 `scriptDetail`（useScriptMurderRoom 依 room.scriptId 載入）提供章節與角色；ScriptMurderPlay 以 `scriptState.assignments` 與 `scriptDetail.roles` 對應顯示 myRole。
- **驗收**：角色與劇本對應正確；玩家數超過角色數時 startGame 回傳 false。

## GAME-001：派對房建立→加入→遊戲→離開無狀態錯亂

- **狀態**：E2E 覆蓋於 `e2e/persona-flows/party-room.spec.ts`（建立、加入、乾杯、複製連結）；狀態由 `usePartyRoomState` 與 API 維繫。
- **驗收**：E2E 與手動通過；若 flake 可先穩化 critical-paths。

## GAME-002：劇本殺房間狀態與 Realtime 同步一致

- **狀態**：`script-murder` 使用 Supabase Realtime；需確保 `useScriptMurderRealtime` 與後端 channel 一致。
- **驗收**：多人同步無錯；可選 E2E 覆蓋。

## GAME-010：遊戲內音效與觸覺可開關

- **狀態**：已實作。`useGameSound` 具 `enabled`/`toggle`，存 localStorage；`useHaptic` 具 `enabled`/`setEnabled`，依 `games-settings.getHapticEnabled`。`SettingsModal` 提供音效與觸覺開關。
- **驗收**：設定可存、遊戲內即時反映。

## GAME-011：派對房過期與清理（cleanup job）

- **狀態**：已文件化。`docs/party-room-flow-api.md` 已註明 GAME-011：可透過 Supabase Edge Function `cleanup-expired-rooms` 或 cron 清理過期房；`GET /api/games/rooms?list=active` 僅回傳未過期房間。
- **驗收**：過期房不殘留；部署見 `npm run supabase:functions:deploy`。

## GAME-012：觀眾模式（若有）不破壞玩家狀態

- **狀態**：可選。若實作觀眾模式，需區分 `game_room_players` 角色與 UI。
- **驗收**：可選。

## GAME-013：GameErrorBoundary 與重試引導 i18n

- **狀態**：已實作。`GamesPageClient` 傳入 `title={t('gameError.title')}`、`desc={t('gameError.desc')}`、`retryLabel={t('gameError.retry')}`、`backLobbyLabel={t('gameError.backLobby')}`；GameErrorBoundary 具 role=alert、aria-describedby，螢幕閱讀器可讀。
- **驗收**：錯誤邊界文案多語；重試與回大廳按鈕可操作。

## GAME-014：關鍵遊戲有完成/成功動畫或回饋

- **狀態**：部分遊戲有慶祝、confetti（如 `fireFullscreenConfetti`、canvas-confetti）；可逐遊戲補齊結束動畫或 Lottie。審計清單：truth-or-dare、roulette、never-have-i-ever 等有完成回饋；其餘可於遊戲元件內補 confetti 或簡短動畫。
- **驗收**：提升遊戲體驗；文件化於本節。

## GAME-017：遊戲列表載入與篩選不卡頓

- **狀態**：已實作。`GameLazyMap` 懶加載遊戲元件（非首屏遊戲動態 import）；Lobby 列表篩選與搜尋不一次渲染全部 DOM；可與 PERF-006 對齊，必要時加虛擬滾動或分頁。
- **驗收**：100+ 項不一次 DOM 全渲染；關鍵路徑無卡頓。

## GAME-018：收藏/最近玩過持久化與同步

- **狀態**：可選。若實作，需 `games-favorites`、`last-session` 與後端或 localStorage 同步。
- **驗收**：跨裝置可選。**Phase B**：不納入本階段；留待後續排期。

## GAME-019：劇本殺劇本列表與預覽

- **狀態**：已實作。script-murder 劇本已擴充至 8 支完整劇本（seed migrations 1～8）；`GET /api/scripts` 回傳 `chapterCount`、`roleCount`；ScriptMurderLobby 卡片顯示章節數/角色數（chaptersAndRoles i18n）；大廳 loading 骨架 8 張、免費方案前 4 支可玩。
- **驗收**：列表顯示 8 支、可建房、可進入房間並載入劇本與角色（GAME-009）；預覽可選延伸。

## GAME-020：派對房 E2E 涵蓋建立→加入→選遊戲

- **狀態**：已實作。`e2e/persona-flows/party-room.spec.ts` 涵蓋：建立房間、加入、乾杯、複製連結、**房主選遊戲**（真心話/轉盤/骰子）並見「目前」遊戲文案；選遊戲用例使用多語 selector（真心話|Truth or dare、轉盤|Roulette、骰子|Liar dice）。
- **驗收**：E2E 通過；若 flake 可調整 timeout 或 selector 穩化。

## GAME-021：遊戲內分享（社交）不破壞狀態

- **狀態**：可選。ShareStoryCardButton 等需不影響遊戲 state。
- **驗收**：可選。

## GAME-022：遊戲數據統計與回顧

- **狀態**：可選。profile/history 或遊戲內統計。
- **驗收**：可選。

---

**關鍵檔案**：`e2e/persona-flows/party-room.spec.ts`、`src/app/party-room`、`src/app/script-murder`、`src/hooks/useGameSound.ts`、`src/hooks/useHaptic.ts`、`src/lib/games-settings.ts`、`src/components/games/SettingsModal.tsx`、`src/components/games/GameLazyMap.tsx`。
