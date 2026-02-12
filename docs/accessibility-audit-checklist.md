# 無障礙審查清單 (A11Y)

用於 Phase 2 任務 A11Y-001、002、003、007、008、009、010、012、013 的驗收與後續審查。

## A11Y-003：色彩對比 WCAG AA

- **目標**：一般文字與背景對比 ≥ 4.5:1、大字（≥18px 或 14px 粗體）≥ 3:1；UI 元件與圖形 ≥ 3:1。
- **作法**：以對比工具（如 WebAIM Contrast Checker、Chrome DevTools Lighthouse、axe）掃描主要頁（首頁、quiz、games、learn、pricing、login、party-room）；design-tokens（如 `globals.css`、Tailwind 主題）確保主要文字色與背景符合比例。
- **審計**：將主要頁面與元件（按鈕、輸入框、連結、導航）納入檢查清單；修正項記錄於本節或 design-tokens。
- [ ] 首頁 CTA 與內文對比達標
- [ ] 表單標籤與輸入框對比達標
- [ ] 導航與 footer 連結對比達標
- [ ] 遊戲/學習頁主要文字與背景達標

## A11Y-001：全站焦點順序與 tab 邏輯合理

- [ ] 無焦點陷阱（Modal、Drawer 內 Tab 循環不跳出、關閉可 Esc）
- [ ] 關鍵頁面 Tab 順序符合視覺邏輯（導航 → 主內容 → 側欄）
- [ ] 動態插入內容（Toast、Modal）不破壞焦點順序

## A11Y-002：互動元件 aria-label 或可見文字

- [ ] 僅圖示按鈕具備 `aria-label` 或 `title`（如關閉、選單、播放）
- [ ] 無僅圖示且無說明的可點擊元件

## A11Y-007：鍵盤可操作所有主要流程

- [x] 遊戲：選遊戲、開始、下一題、結束可全程用 Tab + Enter（Lobby、遊戲內按鈕皆 focusable）
- [x] 學習：課程列表、章節、測驗可鍵盤操作（Link、按鈕可 Tab）
- [x] 訂閱：定價頁、結帳流程可鍵盤完成（CTA、表單可 Tab）
- [x] 派對房 / 劇本殺：加入、開始、離開可鍵盤操作（表單與按鈕可 Tab + Enter）
- **備註**：主要流程無僅滑鼠可點之關鍵動作；Modal/Drawer 具 focus trap 與 Esc 關閉。

## A11Y-008：標題階層 h1→h2→h3 不跳級

- [x] 每頁僅單一 h1（關鍵頁已審計：首頁、quiz、games、learn、pricing、profile、party-room、script-murder）
- [x] 無 h1 後直接 h3（需有 h2）；必要處已修正或文件化
- **審計**：各 page 主標為 h1，區塊為 h2/h3 不跳級；若新增頁面請維持單一 h1。

## A11Y-010：圖片 alt 有意義，裝飾圖 aria-hidden

- [x] 內容圖片：`<Image>` 具備有意義的 `alt`（首頁、learn、profile 等已審計）
- [x] 裝飾圖：`aria-hidden="true"` 或 `alt=""`（BrandLogo、裝飾用圖已處理）
- [x] 無空 `alt` 的內容圖；全站 Image/img 已抽檢，新元件請延續 alt 或 aria-hidden

## A11Y-012：觸控目標至少 44x44px（WCAG 2.5.5）

- [x] 按鈕、導航連結：min-height/min-width ≥ 44px 或 padding 足夠（與既有 48px 對齊，達標）
- [x] 全站 CTA、遊戲內按鈕（.games-touch-target / min-h-[48px] 已廣泛使用）
- [x] 手機底部導航、表單送出鈕（games-touch-target、min-h-[48px]）

## A11Y-009：動畫尊重 prefers-reduced-motion

- [ ] globals.css 已有多處 `@media (prefers-reduced-motion: reduce)` 關閉或簡化動畫
- [ ] framer-motion / 自訂動畫元件（PageTransition、InViewAnimate、MagneticButton 等）依 usePrefersReducedMotion 或 CSS 生效

## A11Y-013：E2E a11y（axe）通過關鍵頁

- [ ] 關鍵頁（首頁、quiz、login、pricing、party-room、learn）E2E 執行 axe 無違規；可與 TEST-015 合一實作

## A11Y-014：語言切換與 RTL 考量

- [x] layout 已預留 `RTL_LOCALES`，未來若新增阿拉伯語等可設 `html[dir="rtl"]`（見 layout.tsx I18N-16 註解）

## A11Y-015：錯誤邊界與載入狀態可讀

- [x] ErrorFallback 具備 `role="alert"`、`aria-live="assertive"`、`aria-label`，螢幕閱讀器可朗讀
- [ ] loading.tsx 等使用 `role="progressbar"`、`aria-label` 語意化

## A11Y-016：清單與地標 role 正確

- [ ] 導航為 `<nav>`、主內容為 `<main>`、列表為 `role="list"`/`listitem`；Lobby 遊戲列表已用 role="list"

## A11Y-017：自訂控制項可鍵盤操作

- [ ] 遊戲內自訂控制（滑桿、輪盤等）可 Tab 聚焦並以鍵盤操作；需逐元件抽檢

## A11Y-018：無障礙聲明頁面更新

- [x] `/accessibility` 頁面存在；可定期更新「已實作項目」與符合等級說明以與實作一致

---

## UX-013：導航當前頁高亮 / aria-current

- [x] Navigation 桌面、底部導航、行動選單之 Link 皆設 `aria-current={isActive ? 'page' : undefined}`（見 `src/components/navigation/Navigation.tsx`）。

---

已實作：A11Y-003 色彩對比審計清單；A11Y-004 表單 aria-invalid/aria-describedby/live region（login、party-room）；A11Y-005 skip link；A11Y-007/008/010/012 鍵盤、標題、alt、觸控達標或文件化；A11Y-009 prefers-reduced-motion；A11Y-011 即時區域 aria-live；A11Y-014 RTL 預留；A11Y-015 ErrorFallback role=alert；A11Y-018 無障礙聲明頁；UX-013 導航 aria-current。
