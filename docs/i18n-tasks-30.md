# i18n 30 項優化任務

目標：Phase 3 的 20 項 + 擴充 10 項，六語系一致、關鍵頁面無硬編碼。

| # | 任務 | 鍵路徑／說明 | 狀態 |
|---|------|----------------|------|
| 1 | 派對直播房頁全文案 | partyRoom.* | ✅ |
| 2 | AI 派對 DJ 頁全文案 | partyDj.*（含 useAiTransition、retry） | ✅ |
| 3 | 狀態頁服務連線文案 | status.* | ✅ |
| 4 | 遊戲頁錯誤邊界文案 | gamesError.* | ✅ |
| 5 | 升級 Modal 標題與說明 | upgrade.* | ✅ |
| 6 | 通用鍵 back / share / copy | common.back, common.share, common.copied | ✅ |
| 7 | 品酒學院今日目標／無結果 | learn.todayChapters, learn.noFilterMatch | ✅ |
| 8 | 六語系 messages 補齊 phase3 鍵 | zh-TW, zh-CN, en, ja, ko, yue | ✅ |
|  ️9 | PartyRoomPage 使用 t('partyRoom.*') | — | ✅ |
| 10 | PartyDJPage 使用 t('partyDj.*') | — | ✅ |
| 11 | StatusServices 使用 t('status.*') | — | ✅ |
| 12 | GamesError 使用 t('gamesError.*') | — | ✅ |
| 13 | UpgradeModal 使用 t('upgrade.*') | — | ✅ |
| 14 | 連結／按鈕 aria-label 使用 t() | 複製邀請、分享編排等 | ✅ |
| 15 | 派對 DJ 錯誤訊息 i18n | partyDj.errorFetch, partyDj.errorGeneric | ✅ |
| 16 | 派對 DJ 流程區塊「分鐘」「遊戲」標籤 | partyDj.minutes, partyDj.gamesLabel | ✅ |
| 17 | 狀態頁「已連接／未設定／異常」 | status.connected, status.notConfigured, status.error | ✅ |
| 18 | 學習頁篩選 placeholder／清除 | learn.searchPlaceholder, learn.clearFilter | ✅ |
| 19 | 文檔對齊與報告更新 | 本文件 + 完成率 | ✅ |
| 20 | BUILD / TS / test 通過 | — | ✅ |
| 21 | 遊戲大廳篩選／分類標籤 | games.filterAll 已於 Lobby「全部」tab 使用 | ✅ |
| 22 | 遊戲卡「人氣／New」 | GameCard 已用 t('games.popular')、t('games.new') | ✅ |
| 23 | 定價頁方案名稱與 FAQ | pricing.faq0q/faq0a… faq6q/faq6a 已用於定價頁（zh-TW、en） | ✅ |
| 24 | Quiz 結果頁 | quiz.resultTitle, quiz.resultDescription | ✅ 已有 |
| 25 | 登入／註冊／忘記密碼 | login.*, auth.* | ✅ 已有 |
| 26 | 錯誤頁 404/500 | notFound.*, error.* | ✅ 已有 |
| 27 | Profile 與訂閱管理 | profile.*, subscription.* | ✅ 已有 |
| 28 | 遊戲內常用按鈕（再來一局、分享） | GameResultActions、Trivia 已用 t('games.playAgain')；exit 用 t('gamesError.backLobby') | ✅ |
| 29 | 學習頁篩選／空狀態 | learn.noFilterMatch, learn.searchPlaceholder | ✅ 已有 |
| 30 | 通用錯誤訊息（network、session） | common.errorNetwork, common.sessionExpired 已補（zh-TW, en） | ✅ |

**說明**：#21–#30 中已與 phase3 重疊或已有鍵者標 ✅；缺鍵或未在組件使用 t() 者標 待辦，後續補齊。
