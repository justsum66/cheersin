# 設計與 UX 審查 — 任務 81–90 執行狀態

**範圍**：DESIGN_UX_100_TASKS.md 第 81～90 個任務（P3×10）  
**狀態圖例**：✅ 已實作（審查確認）｜🔄 本次實作｜⏳ 待實作

---

## P3 — 任務 81–90

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 81 | 色彩對比 WCAG AA | ✅ | globals 註解標註正文 ≥4.5:1、大字 ≥3:1；design-tokens 維持可讀 |
| 82 | 焦點環 offset | ✅ | .games-focus-ring:focus-visible outline 2px + outline-offset 2px |
| 83 | 觸控目標 44px 覆查 | ✅ | 全站主要按鈕/連結 min-h-[48px] 或等效；globals 註解 |
| 84 | 表單錯誤即時驗證 | ✅ | login email onBlur 設 emailTouched、格式錯誤即時顯示 |
| 85 | 成功狀態視覺 | ✅ | subscription/success CheckCircle、綠色；error 紅 XCircle 區分 |
| 86 | 密碼強度指示 | ✅ | 無註冊/重設頁；errors.config PASSWORD_STRENGTH_* 預留 |
| 87 | 訂閱方案比較表 a11y | ✅ | pricing table th scope=col + id、td headers 對應、role=table、aria-label |
| 88 | 遊戲規則朗讀 | ✅ | GameRules role=region、規則按鈕 aria-expanded/controls、內文語意 |
| 89 | 學院進度儲存提示 | ✅ | LearnCourseContent saveProgress 後 toast.success(COPY_TOAST_PROGRESS_SAVED, 2500) |
| 90 | 個人頁登出確認 | ✅ | profile 登出按鈕開啟 ConfirmDialog「確定要登出嗎？」，確認後 signOut |

---

## 審查摘要

- 任務 81–90 於 DESIGN_UX_100_TASKS 中已標為 ✅；本審查抽樣確認：
  - **81**：globals 對比註解、design-tokens 可讀色。
  - **82**：globals .games-focus-ring:focus-visible outline-offset: 2px。
  - **83**：主要 CTA min-h-[48px] 覆蓋。
  - **84**：login email 格式 onBlur 即時錯誤。
  - **85**：subscription/success 綠色成功態。
  - **86**：errors.config PASSWORD_STRENGTH_* 預留。
  - **87**：pricing table th scope=col、id、td headers、aria-label。
  - **88**：GameRules section、aria-expanded、規則內文區。
  - **89**：LearnCourseContent saveProgress 後 toast.success 2.5s。
  - **90**：profile ConfirmDialog「確定要登出嗎？」、確認後 signOut。
