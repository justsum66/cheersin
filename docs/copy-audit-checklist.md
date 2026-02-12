# 文案審閱檢查清單（COPY）

對應 TASKS-170 Phase 2 COPY 相關任務。

## COPY-003：錯誤頁（404/500）友善文案與導航

- [x] `not-found.tsx` 使用 `t('notFound.title')`、`t('notFound.back')`、`t('notFound.popularLinks')`，並提供導航連結（quiz、games、pricing）。
- [x] `error.tsx` 使用 `PageErrorContent` 與 `t('error.title')`、`t('error.description')`、`t('error.retry')`，附重試與首頁/quiz 連結。
- **驗收**：404/500 可引導回站、文案 i18n。

## COPY-004：訂閱頁價值說明與 FAQ

- [x] 定價頁 `pricing/page.tsx` 具 FAQ 區塊（id="faq"），題目與答案來自 `t('pricing.faq')`、`t('pricing.faq0q')`/`t('pricing.faq0a')` 等；結構化資料 FAQPage 已輸出。
- **驗收**：訂閱價值與常見問題可譯、可錨點 #faq。

## COPY-005：學習模組課程內容深度與測驗對齊

- **目標**：每課有學習目標（description 或 learningObjectives）與測驗對齊。
- **現狀**：wine-101、whisky-101、white-wine 已補 `learningObjectives`；LearnCourseContent 課程內頁首屏展示學習目標；validate:lessons、validate:content 通過。
- [x] 至少 2～3 門課具 learningObjectives；[x] 課程內頁首屏展示；[x] 測驗與章節 content 對齊（validate 通過）。

## COPY-006：遊戲說明簡短且可於遊戲內查看

- **目標**：各遊戲說明簡短、玩家可於遊戲內（規則 modal / 說明區）查看。
- **對照**：Lobby 遊戲卡可點「規則」或遊戲內 GameRules / 說明按鈕；規則文案來自 `games.*.rules` 或元件內 `rulesKey`。
- **抽檢方法**：逐遊戲進入 Lobby 點「規則」或進入遊戲內開啟規則 modal，確認說明簡短、可讀、無冗長段落；可抽樣 5～10 個遊戲記錄結果。
- **抽檢記錄**：可依上述方法執行後填寫（例：KingsCup、TruthOrDare、Roulette、LiarDice、ToastRelay 等 5 個已抽檢／待抽檢）。
- [x] 遊戲列表與遊戲內具規則/說明入口（GameRules、rulesKey）；[ ] 逐遊戲抽檢說明簡短且可讀（待抽檢）

## COPY-009：課程章節標題與描述一致多語

- **目標**：課程章節標題與描述在 zh-TW / en 等語系一致可讀、無漏譯。
- **對照**：`messages/learn`（或後台課程 meta）之章節標題與描述；learn 頁面與課程內容使用同一 key。
- **抽檢方法**：依 `messages/learn` 與課程資料（或 API）對照 zh-TW / en，確認章節標題與描述 key 一致、無漏譯或空白；可抽樣數個課程記錄結果。
- **抽檢記錄**：可依上述方法對照 2～3 個課程（如 wine-basics、white-wine）後填寫。
- [ ] 依 messages/learn 與課程資料抽檢標題/描述多語一致（待抽檢）

## COPY-010：測驗題幹與選項審閱

- **範圍**：靈魂酒測（quiz）題幹、選項、結果頁文案；遊戲內測驗題（若有）。
- **檢查項**：
  - [x] 題幹語意清楚、無錯字
  - [x] 選項與題目對應、無重複或漏譯
  - [x] 結果頁（靈魂之酒、類型描述）與設計一致
- **備註**：題目與選項來源為資料或 i18n；新增題目時請依本清單抽檢。
