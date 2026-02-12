# 無障礙審查清單 (A11Y)

用於 Phase 2 任務 A11Y-001、002、003、007、008、009、010、012、013 的驗收與後續審查。

## A11Y-003：色彩對比 WCAG AA

- **目標**：一般文字與背景對比 ≥ 4.5:1、大字（≥18px 或 14px 粗體）≥ 3:1；UI 元件與圖形 ≥ 3:1。
- **工具與步驟**：WebAIM Contrast Checker、Chrome DevTools Lighthouse（Accessibility 面板）、axe DevTools；抽檢步驟：對首頁、quiz、games、learn、pricing、login、party-room 執行 Lighthouse 或 axe，記錄未達標處並修正 design-tokens（`globals.css`、Tailwind 主題）。
- **審計**：將主要頁面與元件（按鈕、輸入框、連結、導航）納入檢查清單；修正項記錄於本節或 design-tokens。
- [ ] 首頁 CTA 與內文對比達標（待抽檢；可對首頁、quiz 跑 Lighthouse Accessibility 或 axe 記錄結果）
- [ ] 表單標籤與輸入框對比達標（待抽檢）
- [ ] 導航與 footer 連結對比達標（待抽檢）
- [ ] 遊戲/學習頁主要文字與背景達標（待抽檢）

## A11Y-005：跳過主內容連結（skip link）

- [x] 根 layout `src/app/layout.tsx` 具 `<a href="#main-content" class="skip-link" aria-label="跳至主內容">`；learn layout 具 `#learn-main` skip link。
- [x] 鍵盤 Tab 可達、聚焦時可見（globals.css `.skip-link:focus` 顯示）；列印時可隱藏。

## A11Y-006：模態框焦點鎖定與 Esc 關閉

- [x] 定價首訪、KingsCup、GameWrapperBody、GameWrapperHeader、PunishmentWheelModal、PaidGameLock、ConfirmDialog 等已補 Esc 關閉或 focus trap；見 Phase 2 續完成紀錄。
- **驗收**：Modal/Drawer 內 Tab 循環不跳出、Esc 關閉。

## A11Y-013：E2E a11y（axe）通過關鍵頁

- [x] `e2e/a11y.spec.ts` 對首頁、Quiz、登入、定價、Games Lobby、learn 執行 `@axe-core/playwright`，斷言無 critical 違規；首頁與 Quiz 另斷言無 serious。
- **驗收**：與 TEST-015 一致；執行 `npm run test:e2e -- e2e/a11y.spec.ts`。

## A11Y-001：全站焦點順序與 tab 邏輯合理

- **驗收步驟（抽檢）**：以鍵盤 Tab 依序走訪關鍵頁（首頁、quiz、games、learn、pricing、login、party-room）；確認無焦點陷阱、順序符合視覺（導航 → 主內容 → 側欄）；開啟 Modal/Drawer 時 Tab 循環不跳出、Esc 可關閉；Toast 出現時不搶焦或破壞順序。**抽檢一輪**：首頁/quiz/login/games Tab 順序已於 E2E 與手動驗證；Modal（定價、KingsCup、ConfirmDialog 等）已補 Esc 與 focus trap；圖示按鈕 aria-label 待逐頁抽檢。
- [x] 無焦點陷阱（Modal、Drawer 內 Tab 循環不跳出、關閉可 Esc）— Phase B 抽檢通過
- [x] 關鍵頁面 Tab 順序符合視覺邏輯（導航 → 主內容 → 側欄）— Phase B 抽檢通過
- [x] 動態插入內容（Toast、Modal）不破壞焦點順序 — Phase B 抽檢通過

## A11Y-002：互動元件 aria-label 或可見文字

- **抽檢步驟**：僅圖示按鈕（無可見文字）需具 `aria-label` 或 `title`；代表性元件：關閉鈕（Modal、Drawer）、選單/漢堡鈕、播放/暫停、複製、分享、導航圖示。可依頁面逐個檢查或抽檢首頁、games、learn、party-room。
- [x] 僅圖示按鈕具備 `aria-label` 或 `title`（如關閉、選單、播放）— Phase B 抽檢通過（首頁、games Lobby、Modal 關閉鈕）
- [x] 無僅圖示且無說明的可點擊元件 — Phase B 抽檢通過

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

- [x] globals.css 已有多處 `@media (prefers-reduced-motion: reduce)` 關閉或簡化動畫（見 globals.css 搜尋 prefers-reduced-motion）
- [x] framer-motion / 自訂動畫元件（PageTransition、InViewAnimate、MagneticButton、Navigation、ParticleBubbles、GameWrapper 等）依 usePrefersReducedMotion 或 CSS 生效；見 `src/hooks/usePrefersReducedMotion.ts`、各元件註解


## A11Y-014：語言切換與 RTL 考量

- [x] layout 已預留 `RTL_LOCALES`，未來若新增阿拉伯語等可設 `html[dir="rtl"]`（見 layout.tsx I18N-16 註解）

## A11Y-015：錯誤邊界與載入狀態可讀

- [x] ErrorFallback 具備 `role="alert"`、`aria-live="assertive"`、`aria-label`，螢幕閱讀器可朗讀
- [x] loading.tsx 等使用 `role="progressbar"`、`aria-label` 語意化（根 loading、login、learn、learn/knowledge 等已具；WineGlassLoading 具 role="status"、aria-label）

## A11Y-016：清單與地標 role 正確

- [x] 導航為 `<nav>`（Navigation.tsx、Sidebar.tsx）、主內容為 `<main>`（各 page、loading）；Lobby 遊戲列表已用 `role="list"`、`aria-label="遊戲列表"`
- **驗收**：nav、main、列表語意正確；新頁面請延續

## A11Y-017：自訂控制項可鍵盤操作

- **抽檢清單（待逐元件抽檢）**：Lobby 篩選（分類/搜尋）、Roulette（輪盤）、PunishmentWheel（懲罰輪盤）、TruthOrDare 選項、KingsCup 抽牌/按鈕、遊戲內表單與按鈕。每項檢查：可 Tab 聚焦、必要時 Arrow/Enter 可操作。
- [x] 滑桿類元件可 Tab 聚焦、鍵盤調整 — Phase B 抽檢通過
- [x] 輪盤/轉盤類可 Tab + 鍵盤觸發（Roulette、PunishmentWheel）— Phase B 抽檢通過
- [x] 其他自訂控制項可鍵盤操作（Lobby 篩選、遊戲內按鈕等）— Phase B 抽檢通過（Lobby 搜尋、分類篩選、人數時長篩選具 aria-label、tabIndex）

## A11Y-018：無障礙聲明頁面更新

- [x] `/accessibility` 頁面存在；可定期更新「已實作項目」與符合等級說明以與實作一致

---

## UX-013：導航當前頁高亮 / aria-current

- [x] Navigation 桌面、底部導航、行動選單之 Link 皆設 `aria-current={isActive ? 'page' : undefined}`（見 `src/components/navigation/Navigation.tsx`）。

---

已實作：A11Y-003 色彩對比審計清單；A11Y-004 表單 aria-invalid/aria-describedby/live region（login、party-room）；A11Y-005 skip link（layout、learn layout）；A11Y-006 模態 Esc 與 focus trap；A11Y-007/008/010/012 鍵盤、標題、alt、觸控達標或文件化；A11Y-009 prefers-reduced-motion；A11Y-011 即時區域 aria-live；A11Y-013 E2E axe（e2e/a11y.spec.ts）；A11Y-014 RTL 預留；A11Y-015 ErrorFallback role=alert；A11Y-018 無障礙聲明頁；UX-013 導航 aria-current。

**Phase B 抽檢（2026-02-11）**：A11Y-001（焦點順序、Modal Esc）、A11Y-002（圖示 aria-label）、A11Y-017（Lobby 篩選與遊戲內按鈕鍵盤可達）— 抽檢通過並勾選。
