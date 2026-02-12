# UX Batch 3 審計（UX-008～012, 014～019, 021, 022）

對應計畫「下一批 70 任務」Batch 3。

## UX-008：深色/淺色主題無對比遺漏

- **狀態**：全站以深色主題為主；`globals.css` 內有 `.dark` 選項（如 `.dark .pro-gradient-border`、img 亮度）。
- **驗收**：兩主題皆可讀；若啟用淺色需審查 contrast。目前設計 token 與按鈕/連結 focus 環（`focus-visible`）已具對比。

## UX-009：響應式斷點與 RWD 文件一致

- **狀態**：已實作。`docs/rwd-breakpoints.md` 定義 sm/md/lg/xl/2xl；Tailwind 來自 `design-tokens.ts`。
- **驗收**：三斷點（mobile / tablet / desktop）無錯位；E2E 含 375px、768px 檢驗。

## UX-010：遊戲與學習 CTA 明顯且文案一致

- **狀態**：首頁 hero CTA、`/learn`、`/games` 使用 `common.cta`、`nav.*` 與 config；轉換路徑清晰。
- **驗收**：遊戲/學習入口按鈕可見、文案一致（i18n）。

## UX-011：空狀態（無資料）有說明與行動引導

- **狀態**：`EmptyState` 元件（`src/components/ui/EmptyState.tsx`）提供 title、description、action；列表頁與 profile 可引用。
- **驗收**：列表無資料時顯示 EmptyState，非空白區塊。

## UX-012：成功操作有 toast 或即時回饋

- **狀態**：已實作。`react-hot-toast` + `Toaster` 於 layout；登入成功、加入房間、複製、訂閱、儲存等皆有 `toast.success` 或對應回饋。
- **驗收**：訂閱成功、加入房間、儲存等有一致 toast/回饋。

## UX-013：導航當前頁高亮 / aria-current

- **狀態**：已實作。`Navigation.tsx` 桌面與底部導航使用 `aria-current={isActive ? 'page' : undefined}`，並有視覺高亮（nav-pill、底線）。
- **驗收**：用戶知所在頁面。

## UX-014：長內容可讀性（行寬、行高）

- **狀態**：課程內文使用 `max-w-3xl`、`max-w-2xl`、`leading-relaxed`/`leading-loose`（LearnCourseContent）；列印樣式 `max-width:720px`、`line-height:1.6`。
- **驗收**：長文不超約 75ch 等效，行高舒適。

## UX-015：微互動（hover/focus）一致

- **狀態**：按鈕/連結使用 `games-focus-ring`、`whileHover`/`whileTap`（framer-motion）、`hover:text-white` 等；`globals.css` 統一 focus-visible 環。
- **驗收**：按鈕與連結有一致反饋。

## UX-016：彈窗與抽屜動畫流暢

- **狀態**：Modal、Drawer 使用 framer-motion `AnimatePresence`；`prefers-reduced-motion` 時縮短或關閉動畫。
- **驗收**：開啟/關閉無卡頓。

## UX-017：表單驗證即時（onBlur 或 debounce）

- **狀態**：登入、註冊、房間密碼等表單有 client 驗證；部分欄位可補 onBlur 或 debounce 即時錯誤顯示。
- **驗收**：不只在 submit 才顯示錯誤（可逐頁補強）。

## UX-018：無障礙焦點可見（outline）

- **狀態**：已實作。`globals.css` 內 `:focus-visible` 設 outline + box-shadow；`.btn-*:focus-visible`、`a:focus-visible`、`.games-focus-ring` 等一致。
- **驗收**：鍵盤導航可辨識焦點。

## UX-019：首屏與內頁 meta 描述差異化

- **狀態**：`getRootMeta(locale)` 提供首頁 meta；各頁可於 `generateMetadata` 覆寫 title/description。I18N-17 已接 messages。
- **驗收**：SEO 與預覽正確；內頁有差異化 description。

## UX-021：遊戲結束與派對房結束狀態明確

- **狀態**：遊戲與派對房需有結算或「返回大廳」等引導；可於各遊戲元件與 party-room 結束流程補齊。
- **驗收**：結束後有明確狀態或 CTA。

## UX-022：訂閱方案對比清晰

- **狀態**：`pricing/page.tsx` 使用 `COMPARISON_ROWS_PRICING`、`PRICING_PLANS_DISPLAY` 呈現方案與功能對比；FAQ、見證輪播已存在。
- **驗收**：方案差異易比較。

---

**關鍵檔案**：`src/app/globals.css`、`docs/rwd-breakpoints.md`、`src/components/navigation/Navigation.tsx`、`src/components/ui/EmptyState.tsx`、layout Toaster、`src/app/pricing/page.tsx`、`src/lib/i18n/server-meta.ts`。
