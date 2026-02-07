# 設計與 UX 審查 — 任務 91–100 執行狀態（最終批）

**範圍**：DESIGN_UX_100_TASKS.md 第 91～100 個任務（P3×10）  
**狀態圖例**：✅ 已實作（審查確認）｜🔄 本次實作｜⏳ 待實作

---

## P3 — 任務 91–100

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 91 | 品牌聲調與錯誤文案 | ✅ | errors.config ERROR_FALLBACK_TITLE、EMPTY_STATE_*、ERROR_FORM_HEADING；ErrorFallback/登入表單共用 |
| 92 | 微複製統一 | ✅ | copy.config.ts CTA/Toast/空狀態常數；登入/訂閱成功/error/LearnCourseContent 改用 config |
| 93 | 離線態橫幅 | ✅ | OfflineBanner 偵測 navigator.onLine，文案「目前離線，部分功能可能無法使用」；layout 使用 |
| 94 | PWA 安裝提示 | ✅ | AddToHomeScreenBanner 延遲/可關閉、localStorage 不再顯示 |
| 95 | 深色模式切換動畫 | ✅ | globals html/body transition: background-color 0.25s, color 0.25s |
| 96 | 字級縮放支援 | ✅ | globals :root 字階 rem；註解標註避免 px 標題、支援瀏覽器縮放 |
| 97 | 列印連結 URL | ✅ | @media print a[href]:after { content: " (" attr(href) ")"; font-size: 0.9em; } |
| 98 | Cookie 偏好儲存 | ✅ | CookieConsentBanner 接受/拒絕寫入 localStorage cookie_consent，mount 讀取後不重複顯示 |
| 99 | 設計系統文件 | ✅ | docs/DESIGN_SYSTEM.md — 色彩、字級、間距、圓角陰影、按鈕輸入、動畫、組件清單 |
| 100 | 設計師交接清單 | ✅ | docs/DESIGN_HANDOFF.md — 色板、字級、間距、組件、Figma 預留、變更流程 |

---

## 審查摘要

- 任務 91–100 於 DESIGN_UX_100_TASKS 中已標為 ✅；本審查抽樣確認：
  - **91**：errors.config 統一錯誤/空狀態文案；ErrorFallback 與登入表單共用。
  - **92**：copy.config 與各頁改用 config。
  - **93**：OfflineBanner 存在、layout 使用、文案「目前離線，部分功能可能無法使用」。
  - **94**：AddToHomeScreenBanner 延遲與可關閉、localStorage。
  - **95**：globals html/body transition 0.25s。
  - **96**：globals :root 字階 rem、註解。
  - **97**：@media print a[href]:after content attr(href)。
  - **98**：CookieConsentBanner localStorage cookie_consent。
  - **99**：docs/DESIGN_SYSTEM.md 存在。
  - **100**：docs/DESIGN_HANDOFF.md 存在。

---

## DESIGN_UX_100_TASKS 全 100 項審查狀態

- **前 50 項**：UX_100_TASKS_AUDIT_FIRST_50.md（P0×5、P1×10、P2×16、P3×19）
- **51–60**：UX_100_TASKS_AUDIT_51_60.md（P2×10）
- **61–70**：UX_100_TASKS_AUDIT_61_70.md（P3×10）
- **71–80**：UX_100_TASKS_AUDIT_71_80.md（P3×10）
- **81–90**：UX_100_TASKS_AUDIT_81_90.md（P3×10）
- **91–100**：本文件（P3×10）

全 100 項審查完成。
