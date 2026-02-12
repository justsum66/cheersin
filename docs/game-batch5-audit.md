# Game Batch 5 審計（GAME-001, 002, 010～022）

對應計畫「下一批 70 任務」Batch 5。

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

- **狀態**：需於 Supabase Edge Functions 或 cron 實作過期房清理；文件化或實作依專案排程。
- **驗收**：過期房不殘留。

## GAME-012：觀眾模式（若有）不破壞玩家狀態

- **狀態**：可選。若實作觀眾模式，需區分 `game_room_players` 角色與 UI。
- **驗收**：可選。

## GAME-014：關鍵遊戲有完成/成功動畫或回饋

- **狀態**：部分遊戲有慶祝、confetti（如 `fireFullscreenConfetti`）；可逐遊戲補齊結束動畫。
- **驗收**：提升遊戲體驗。

## GAME-017：遊戲列表載入與篩選不卡頓

- **狀態**：`GameLazyMap` 懶加載遊戲元件；列表可考慮虛擬滾動或分頁（PERF-006）。
- **驗收**：100+ 項不一次 DOM 全渲染。

## GAME-018：收藏/最近玩過持久化與同步

- **狀態**：可選。若實作，需 `games-favorites`、`last-session` 與後端或 localStorage 同步。
- **驗收**：跨裝置可選。

## GAME-019：劇本殺劇本列表與預覽

- **狀態**：可選。script-murder 劇本列表與預覽可於 API 與 UI 補齊。
- **驗收**：可選。

## GAME-020：派對房 E2E 涵蓋建立→加入→選遊戲

- **狀態**：`e2e/persona-flows/party-room.spec.ts` 已涵蓋建立、加入、乾杯、複製；可擴充「房主選遊戲」流程。
- **驗收**：E2E 通過。

## GAME-021：遊戲內分享（社交）不破壞狀態

- **狀態**：可選。ShareStoryCardButton 等需不影響遊戲 state。
- **驗收**：可選。

## GAME-022：遊戲數據統計與回顧

- **狀態**：可選。profile/history 或遊戲內統計。
- **驗收**：可選。

---

**關鍵檔案**：`e2e/persona-flows/party-room.spec.ts`、`src/app/party-room`、`src/app/script-murder`、`src/hooks/useGameSound.ts`、`src/hooks/useHaptic.ts`、`src/lib/games-settings.ts`、`src/components/games/SettingsModal.tsx`、`src/components/games/GameLazyMap.tsx`。
