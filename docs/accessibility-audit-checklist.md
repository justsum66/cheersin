# 無障礙審查清單 (A11Y)

用於 Phase 2 任務 A11Y-001、002、007、008、009、010、012、013 的驗收與後續審查。

## A11Y-001：全站焦點順序與 tab 邏輯合理

- [ ] 無焦點陷阱（Modal、Drawer 內 Tab 循環不跳出、關閉可 Esc）
- [ ] 關鍵頁面 Tab 順序符合視覺邏輯（導航 → 主內容 → 側欄）
- [ ] 動態插入內容（Toast、Modal）不破壞焦點順序

## A11Y-002：互動元件 aria-label 或可見文字

- [ ] 僅圖示按鈕具備 `aria-label` 或 `title`（如關閉、選單、播放）
- [ ] 無僅圖示且無說明的可點擊元件

## A11Y-007：鍵盤可操作所有主要流程

- [ ] 遊戲：選遊戲、開始、下一題、結束可全程用 Tab + Enter
- [ ] 學習：課程列表、章節、測驗可鍵盤操作
- [ ] 訂閱：定價頁、結帳流程可鍵盤完成
- [ ] 派對房 / 劇本殺：加入、開始、離開可鍵盤操作

## A11Y-008：標題階層 h1→h2→h3 不跳級

- [ ] 每頁僅單一 h1
- [ ] 無 h1 後直接 h3（需有 h2）
- [ ] 關鍵頁：首頁、quiz、games、learn、pricing、profile、party-room、script-murder

## A11Y-010：圖片 alt 有意義，裝飾圖 aria-hidden

- [ ] 內容圖片：`<Image>` 具備有意義的 `alt`
- [ ] 裝飾圖：`aria-hidden="true"` 或 `alt=""`
- [ ] 無空 `alt` 的內容圖

## A11Y-012：觸控目標至少 44x44px

- [ ] 按鈕、導航連結：min-height/min-width ≥ 44px 或 padding 足夠
- [ ] 全站 CTA、遊戲內按鈕（已有 .games-touch-target / min-h-[48px] 處可抽檢）
- [ ] 手機底部導航、表單送出鈕

## A11Y-009：動畫尊重 prefers-reduced-motion

- [ ] globals.css 已有多處 `@media (prefers-reduced-motion: reduce)` 關閉或簡化動畫
- [ ] framer-motion / 自訂動畫元件（PageTransition、InViewAnimate、MagneticButton 等）依 usePrefersReducedMotion 或 CSS 生效

## A11Y-013：E2E a11y（axe）通過關鍵頁

- [ ] 關鍵頁（首頁、quiz、login、pricing、party-room、learn）E2E 執行 axe 無違規；可與 TEST-015 合一實作

---

已實作：A11Y-004 表單 aria-invalid/role=alert（login、party-room、GamesPageClient 等）；A11Y-005 skip link（layout、learn layout，聚焦可見）；A11Y-009 prefers-reduced-motion（globals.css、Navigation、GameWrapper、InViewAnimate、PageTransition、ParticleBubbles 等）；A11Y-011 即時區域 aria-live（party-room、script-murder）。
