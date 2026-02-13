# A11Y 無障礙審計檢查清單

本文件紀錄關鍵頁面鍵盤與無障礙審計結果。

## A11Y-001：全站焦點順序與 tab 邏輯合理

**範圍**：各頁 layout、modal、表單

### 審計項目

| 頁面/區塊 | 焦點順序符合視覺 | 無焦點陷阱 | 備註 |
|----------|------------------|------------|------|
| 登入頁 login | ✅ | ✅ | 表單欄位依序、skip link 可達 |
| 模態框 Modal/Drawer | ✅ | ✅ | A11Y-006 focus trap 已實作 |
| 派對房表單 | ✅ | ✅ | 暱稱→密碼→加入 |
| 劇本殺 ScriptMurderRoom | ✅ | ✅ | displayName→加入 |
| 遊戲大廳 Lobby | ✅ | ✅ | 分類 tab→卡片 grid |
| 訂閱頁 pricing | ✅ | ✅ | 方案卡片→FAQ 手風琴 |

### 抽檢方法

- Tab 從 skip link 開始，依序進入主內容、表單、按鈕
- Modal 開啟時焦點鎖定在內、Esc 關閉後回到觸發元素
- 無「焦點跳出 modal 到背景」之陷阱

### 審計結論

- 關鍵流程焦點順序合理；focus trap 於 Modal、Drawer、ConfirmDialog 已覆蓋
- 表單錯誤時 scrollToFirstError 導向第一個錯誤欄位

## A11Y-002：互動元件 aria-label 或可見文字

**範圍**：buttons、links、icons

### 抽檢項目

| 元件類型 | 範例 | 狀態 |
|----------|------|------|
| 僅圖示按鈕 | 登入頁顯示/隱藏密碼、遊戲規則、設定 | ✅ 有 aria-label |
| 導航連結 | Navigation 各 nav item | ✅ 有可見文字或 aria-label |
| OAuth 按鈕 | Google/Apple/Line | ✅ aria-label 含「以…登入」 |
| 遊戲控制 | 骰子、轉盤、真心話按鈕 | ✅ 有 aria-label 或按鈕內文字 |

### 驗收

- 無僅圖示無說明的關鍵互動；螢幕閱讀器可讀取

## A11Y-007：鍵盤可操作所有主要流程

**範圍**：遊戲、學習、訂閱、導航

### 審計項目

| 頁面/區塊 | 鍵盤可達 | 備註 |
|----------|----------|------|
| 導航 Navigation | ✅ | Link/button 原生可聚焦；aria-current 已設 |
| 跳過主內容 skip-link | ✅ | A11Y-005 已完成 |
| 遊戲大廳 Lobby | ✅ | GameCard tabIndex=0、category tabs 可鍵盤切換 |
| 遊戲內 GameWrapper | ✅ | 規則按鈕、返回按鈕、遊戲控制皆 games-focus-ring |
| 學習頁 learn | ✅ | 課程卡片 Link、篩選按鈕可聚焦 |
| 訂閱頁 subscription/pricing | ✅ | PayPal 按鈕、方案連結可聚焦 |
| 助理頁 assistant | ✅ | 輸入框、送出按鈕、歷史區可聚焦 |
| 模態框 Modal/Drawer | ✅ | A11Y-006 focus trap + Esc 關閉 |

### 審計結論

- 關鍵頁面互動元素使用 `<button>`、`<a>` 或 `tabIndex={0}` + `games-focus-ring`
- 無僅滑鼠可點（onClick 無 tabIndex）之關鍵流程

## A11Y-008：標題階層 h1→h2→h3 不跳級

審計各 page.tsx 時確認：每頁單一 h1，階層連續。

## A11Y-009：動畫尊重 prefers-reduced-motion

**實作**：
- `ClientProviders` 使用 `MotionConfig reducedMotion="user"` 全站尊重 OS 設定
- `usePrefersReducedMotion` hook / framer-motion `useReducedMotion` 於關鍵元件（Nav、quiz、ScriptMurderPlay、PageTransition 等）
- CSS `@media (prefers-reduced-motion: reduce)` 於 base、utilities、components、shared

## A11Y-010：圖片 alt 有意義，裝飾圖 aria-hidden

**審計結果**：通過
- 內容圖：profile avatar、WineCard、testimonials、BrandLogo、LearnCourseContent、ImageLightbox、Avatar、PartyRoomManager 皆有意義 alt
- 裝飾圖：PhotoGuess 使用 Lucide Image 圖示 + `aria-hidden`；課程封面 placeholder 區塊 `aria-hidden`

## A11Y-011：直播/即時區域 aria-live

**實作**：
- **party-room**：PartyRoomActive 等待玩家/錯誤/玩家列表已有 `role="status" aria-live="polite"` 或 `role="alert" aria-live="assertive"`；PartyRoomManager 線上人數與玩家列表補上 `aria-live="polite"`
- **script-murder**：ScriptMurderRoom 加入錯誤、玩家列表；ScriptMurderPlay 等待房主、投票區；ScriptMurderLobby 載入/錯誤 皆有適當 aria-live
