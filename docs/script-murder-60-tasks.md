# 劇本殺 60 項優化任務（SM-21～SM-80）

對應計畫：Script-murder 60 項優化與 FIX。原 20 項見 [script-murder-20-tasks.md](script-murder-20-tasks.md)。

## Phase 1：i18n（SM-21～SM-30）+ FIX（SM-61～SM-75）

| ID | 狀態 | 說明 |
|----|------|------|
| SM-21 | ☑ | 房間加入區塊：displayName、enterNamePlaceholder、joinButton 改為 t() |
| SM-22 | ☑ | Lobby「返回首頁」改為 t('scriptMurder.backToHome') |
| SM-23 | ☑ | Lobby 空狀態「先去派對遊樂場」改為 t('scriptMurder.goToPartyGames') |
| SM-24 | ☑ | Lobby 劇本卡「X–Y 人 · 約 Z 分鐘」改為 playersAndDuration |
| SM-25 | ☑ | Lobby 現有房間 fallback、playersCount 改為 i18n |
| SM-26 | ☑ | page 錯誤「無法載入劇本列表」改為 t('scriptMurder.errorLoadScripts') |
| SM-27 | ☑ | page 通用「載入中…」改為 t('scriptMurder.loading') |
| SM-28 | ☑ | messages 六語系補齊 scriptMurder 新 key |
| SM-29 | ☑ | joinError 顯示為字串（已有） |
| SM-30 | ☑ | ScriptMurderEnded 已用 t()，確認無殘留中文 |
| SM-61 | ☑ | 房間加入表單：空字串不送 API、按鈕 disabled |
| SM-62 | ☑ | Lobby 劇本卡 createRoomAria、upgradeUnlockAria 使用 t() |
| SM-63 | ☑ | 現有房間 Link href 使用 encodeURIComponent(r.slug) |
| SM-64 | ☑ | 遊戲中「載入中…」改為 t('scriptMurder.loading') |
| SM-65 | ☑ | confirm dialog 關閉時 focus 回到觸發按鈕（ConfirmDialog triggerRef） |
| SM-66 | ☑ | 投票選項空陣列時顯示 noVoteOptions |
| SM-67 | ☑ | chapterIndex 超出時 fallback、chapterError |
| SM-68 | ☑ | 複製邀請失敗時 toast.error（useCopyInvite onCopyFail） |
| SM-69 | ☑ | leave API 失敗不 push，成功才 push（已有） |
| SM-70 | — | 建立房間後可選 router.push 不整頁重載（維持現狀） |
| SM-71 | ☑ | 房間過期顯示 roomExpired |
| SM-72 | ☑ | 玩家列表空時顯示 noPlayersYet |
| SM-73 | ☑ | startGame 失敗時關閉 ConfirmDialog 並 toast |
| SM-74 | — | postScriptAction 失敗重試（目前 refetch） |
| SM-75 | ☑ | 六語系 scriptMurder 鍵一致 |

## Phase 2：顯示/RWD（SM-31～SM-38）+ UX（SM-39～SM-46）

| ID | 狀態 | 說明 |
|----|------|------|
| SM-31 | ☑ | 大廳劇本卡 min-h 44px、flex-col sm:flex-row（已有 grid） |
| SM-32 | ☑ | 房間邀請區 flex-col sm:flex-row |
| SM-33 | ☑ | 章節進度條 overflow-x-auto 橫向捲動 |
| SM-34 | ☑ | 投票結果長條 truncate + title |
| SM-35 | ☑ | 結束頁統計卡 grid-cols-1 sm:grid-cols-3、按鈕 flex-col sm:flex-row |
| SM-36 | ☑ | 角色卡 break-words |
| SM-37 | ☑ | 懲罰區塊 p-4 sm:p-5、break-words |
| SM-38 | ☑ | page 中繼狀態 max-w-md mx-auto py-8 |
| SM-39 | ☑ | 房間「開始遊戲」whileTap |
| SM-40 | ☑ | 房間「離開房間」whileTap |
| SM-41 | ☑ | 加入按鈕 joining 態與 whileTap |
| SM-42 | ☑ | 大廳建立房間 creating 文案已有 |
| SM-43 | ☑ | 下一章／確認執行 whileTap、actionLoading 已有 |
| SM-44 | ☑ | AnimatePresence、投票動畫已有 |
| SM-45 | ☑ | 結束頁按鈕 motion 入場、roomSlug encodeURIComponent |
| SM-46 | ☑ | 房間過期時隱藏開始按鈕 |

## Phase 3～4：功能、後端、模組、E2E（SM-47～SM-80）

| ID | 狀態 | 說明 |
|----|------|------|
| SM-47～SM-52 | ☑ | trim/長度、建立房間錯誤、minPlayers、輪詢/重試、join/script-murder API、slug encode、locked |
| SM-53～SM-57 | ☑ | join 400 roomFull、leave、advance totalChapters、stripHtml/驗證、SM-56 房間已滿 i18n、SM-49 sessionStorage 清除 |
| SM-58～SM-60 | ☑ | Gate：AgeGate 涵蓋 /script-murder、/party-room；型別已集中 @/types/script-murder；error.tsx + error.scriptMurder* 六語 |
| SM-76～SM-80 | ☑ | E2E persona-flows/script-murder.spec.ts：大廳可達、建立房間、加入、玩家列表、離開 |
