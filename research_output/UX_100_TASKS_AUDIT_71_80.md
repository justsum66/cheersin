# 設計與 UX 審查 — 任務 71–80 執行狀態

**範圍**：DESIGN_UX_100_TASKS.md 第 71～80 個任務（P3×10）  
**狀態圖例**：✅ 已實作（審查確認）｜🔄 本次實作｜⏳ 待實作

---

## P3 — 任務 71–80

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 71 | 各頁 meta description 長度 | ✅ | layout description 約 150 字元；各頁 metadata 已檢查 |
| 72 | OG 圖與標題 | ✅ | opengraph-image、metadata openGraph/twitter 與各頁一致 |
| 73 | 表單 autocomplete | ✅ | login email/current-password；訂閱優惠碼 autoComplete=off |
| 74 | 輸入 type 與 inputmode | ✅ | login type=email/password；訂閱無電話欄位 |
| 75 | 按鈕 loading 無閃爍 | ✅ | login 提交 min-w-[12rem]、內層 min-w-[7rem]、「登入中…」+ 旋轉圖示 |
| 76 | Toast 堆疊順序 | ✅ | layout Toaster containerStyle zIndex 150，低於 Modal |
| 77 | Modal 焦點陷阱 | ✅ | Navigation useFocusTrap；GameWrapper/SettingsModal/UpgradeModal focus trap |
| 78 | Breadcrumb 結構化資料 | ✅ | learn layout、learn/[courseId]、games layout BreadcrumbList JSON-LD |
| 79 | FAQ schema | ✅ | pricing 頁 faqJsonLd FAQPage script |
| 80 | 導航鍵盤快捷 | ✅ | Nav 行動選單 Esc 關閉並 focus 回漢堡鈕；Enter/Space 展開 |

---

## 審查摘要

- 任務 71–80 於 DESIGN_UX_100_TASKS 中已標為 ✅；本審查抽樣確認：
  - **71/72**：layout metadata description 長度、OG 與各頁一致。
  - **73/74**：login 有 type=email/password、autoComplete=email/current-password。
  - **75**：login 提交按鈕 loading 有 min-width 與「登入中…」。
  - **76**：Toaster zIndex 150。
  - **77**：useFocusTrap（Nav）、GameWrapper/SettingsModal focus trap。
  - **78/79**：BreadcrumbList（learn、games）、FAQPage（pricing）。
  - **80**：Navigation Esc/Enter 與 Tab 順序。
