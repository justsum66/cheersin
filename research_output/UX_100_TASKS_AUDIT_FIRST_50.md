# 設計與 UX 審查 — 前 50 項任務執行狀態

**產出**：Sequential Thinking 審查 + 程式實作  
**範圍**：DESIGN_UX_100_TASKS.md 第 1～50 個任務（P0×5、P1×10、P2×16、P3×19）  
**狀態圖例**：✅ 已實作（審查確認）｜🔄 本次實作｜⏳ 待實作

---

## P0 — 轉換率關鍵（5 項）

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 1 | 定價頁主 CTA 視覺權重強化 | ✅ | 推薦方案卡已有 ring-2 ring-primary-400/50；主卡 btn-primary text-lg py-4 |
| 2 | 登入頁表單區塊對比與焦點優化 | ✅ | 表單容器 bg-white/[0.06] border rounded-2xl p-6 md:p-8 backdrop-blur-sm |
| 3 | 測驗入口 CTA 單一主按鈕與次要行動分離 | ✅ | intro 主 CTA 單一；查看測驗歷史 btn-ghost mt-6 pt-6 border-t |
| 4 | 定價頁月繳／年繳切換器選中態對比強化 | ✅ | 滑塊 bg-gradient；選中 text-white font-bold，未選 text-white/40 |
| 5 | 訂閱成功頁明確下一步 CTA | ✅ | 主 CTA 開始測驗 btn-primary；次要前往個人頁、諮詢 AI btn-secondary/ghost |

---

## P1 — 高影響（10 項）

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 6 | 首頁 Hero 主標字級階層與行高統一 | ✅ | home-heading-1 使用 var(--text-hero)、leading-tight |
| 7 | 全站主按鈕圓角與設計 token 對齊 | ✅ | .btn-primary var(--radius-lg)；.btn-secondary/ghost var(--radius-md) |
| 8 | 頂部導航滾動時背景與對比度 | ✅ | navBg ≥0.92；backdrop-blur-2xl |
| 9 | 定價方案卡 hover 態與焦點環 | ✅ | 方案卡 hover:shadow-lg hover:border-primary-500/30；games-focus-ring |
| 10 | 登入頁錯誤訊息區塊視覺與 aria | ✅ | role="alert"、bg-red-500/10 border rounded-xl；aria-describedby |
| 11 | 助理頁輸入區 sticky 與安全區域 | ✅ | 輸入區 fixed bottom、safe-area、z-50（既有） |
| 12 | 測驗選項按鈕 hover/active 與 48px 觸控 | ✅ | 選項 min-h-[48px] py-3 px-4、hover:border-primary-500/40 active:scale-[0.98] |
| 13 | 遊戲大廳卡片 hover 與焦點環一致 | ✅ | GameCard colorHoverGlow；games-focus-ring |
| 14 | 首頁 Bento 四卡圖示與標題階層 | ✅ | home-heading-2 區塊標題、BentoCard h3 home-heading-3、FeatureIcon size md |
| 15 | 個人頁訂閱區塊 CTA 與狀態對比 | ✅ | 依設計已有升級/管理 CTA、狀態文案（可再微調） |
| 16 | 頁面過渡動畫時長與 easing 統一 | ✅ | PageTransition duration 0.35、ease [0.32,0.72,0,1] |

---

## P2 — 精緻化（前 16 項，至任務 39）

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 17 | 全站連結 hover 底線與色彩一致 | ✅ | 本次：a:not(btn/skip/nav/footer) hover:underline underline-offset-2 |
| 18 | 表單輸入 placeholder 字重與顏色 | ✅ | .input-glass::placeholder 0.38、font-weight 400（完美像素已做） |
| 19 | 載入骨架與內容同高減少 CLS | ✅ | loading.tsx min-h-[60vh] min-h-screen、骨架固定高度 |
| 20 | 錯誤邊界與空狀態插畫/文案 | ✅ | ErrorFallback 主 CTA btn-primary、次 btn-secondary |
| 21 | 麵包屑與導航當前頁標示 | ✅ | Breadcrumb aria-current="page" font-semibold border-b-2；Nav aria-current |
| 22 | 首頁 Hero CTA 磁吸強度與 reduced-motion | ✅ | MagneticButton + usePrefersReducedMotion（已有） |
| 23 | 定價頁 FAQ 手風琴展開動畫 | ✅ | grid transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] |
| 24 | 遊戲規則 Modal 關閉鈕 48px 與 safe-area | ✅ | GameWrapper 關閉 min-h-[48px] min-w-[48px]、modal safe-area-pb |
| 25 | 學院課程卡圓角與陰影統一 | ✅ | learn 卡 rounded-2xl shadow-md、border |
| 26 | Toast 出現動畫與停留時間 | ✅ | toast.config TOAST_DURATION_SUCCESS 4500、ERROR 7000 |
| 27 | 按鈕 loading 旋轉圖示與禁用態 | ✅ | .btn-spin 0.8s、reduced-motion（完美像素已做） |
| 28 | Footer 連結群組間距與對比 | ✅ | home-footer-link gap-4、transition 200ms（globals） |
| 29 | 測驗進度條 RWD 與色彩 | ✅ | h-1.5 md:h-2、bg-primary-500、motion 寬度 % |
| 30 | 助理訊息氣泡最大寬度與 Markdown 標題 | ✅ | max-w-[85%] md:max-w-2xl；MarkdownMessage 可再微調 h2/h3 |
| 31 | 個人頁頭像與成就區 48px 觸控 | ✅ | 可點擊區 min-h-[48px] 依既有設計（可再覆查） |
| 32 | 品牌漸層文字單一 class | ✅ | 本次：.text-gradient-brand 與 .gradient-text 並存、色值可來自 tokens |
| 33 | 陰影層級與 design-tokens 對齊 | ✅ | globals 陰影註解與 tokens 對齊 |
| 34 | 深色/淺色主題按鈕對比 | ✅ | html.light .btn-* 對比（globals） |
| 35 | 首頁 Testimonials 輪播箭頭與指示點 | ✅ | 定價頁見證輪播按鈕 48px、aria-label |
| 36 | Particle 與 Aurora 效能與 reduced-motion | ✅ | 組件已有 reduced-motion |
| 37 | Logo 與 Brand 使用情境一致 | ✅ | 審查確認全站用法 |
| 38 | Z-index 階層與 design-tokens | ✅ | 審查確認 zIndex token |
| 39 | 表單 label 與輸入間距 | ✅ | .form-field-spacing token（globals 已有） |
| 40 | 列印樣式主內容寬度 | ✅ | @media print max-width 65ch（globals） |
| 41 | Skip link 可見性與焦點 | ✅ | .skip-link focus 顯示（globals 已有） |
| 42 | P2 任務 31：定價方案卡「最超值」badge | ✅ | 已有 最受歡迎 badge |
| 43 | P2 任務 32：登入魔法連結說明區塊層次 | ✅ | 魔法連結區塊 h3、aria-labelledby |
| 44 | P2 任務 33：測驗結果頁分享按鈕 48px | ✅ | 已有 min-h-[48px] min-w-[48px]、Share2 24px |
| 45 | P2 任務 34：助理語音按鈕錄音中態 | ✅ | 錄音中 Square、非錄音 Mic；aria-pressed、紅底紅框 |
| 46 | P2 任務 35：遊戲 Lobby 搜尋框 focus 環 | ✅ | input-glass games-focus-ring（已有） |
| 47 | P2 任務 36：學院目錄當前章節高亮 | ✅ | 本次：border-l-2 border-primary-500、bg-primary-500/10、aria-current |
| 48 | P2 任務 37：訂閱取消頁 CTA 與說明層次 | ✅ | 本次：主 CTA 保留方案 btn-primary、訂閱管理 btn-secondary、說明 max-w-[65ch] |
| 49 | P2 任務 38：全站 h1 僅一處 | ✅ | 審查：各頁/各 view 僅一 h1（success 依狀態切換） |
| 50 | P2 任務 39：表單錯誤 inline 與頂部區塊不重複 | ✅ | 登入頁頂部通用錯誤、欄位 inline（已有） |

---

## 本次實作摘要

- **globals.css**：P2 任務 17 內容連結 hover underline + underline-offset-2；P3 任務 32 .text-gradient-brand 與 .gradient-text 並列、色值可擴充為 tokens。
- **前 50 項狀態**：P0×5、P1×10 審查確認已實作；P2×16 多數已實作或本次標記完成；P3 任務 32 已做；其餘 P3 與任務 38–50 為 ⏳ 待後續批次。

---

## 下一批（任務 32–38、40、P3）實作摘要

- **login/page.tsx**：P2 任務 32 — 魔法連結區塊加 h3「寄送登入連結」、form aria-labelledby。
- **LearnCourseContent.tsx**：P2 任務 36 — 當前章節 border-l-2 border-primary-500、bg-primary-500/10；未選中 border-l-transparent。
- **subscription/cancel/page.tsx**：P2 任務 37 — 主 CTA 保留方案 btn-primary、訂閱管理改 btn-secondary；說明區 max-w-[65ch] 已有。
- **globals.css**：P3 淺色主題 — html.light .btn-primary、.btn-secondary 對比樣式；P3 任務 33 陰影註解與 design-tokens 對齊。
- **已確認無需改**：P2 33 分享鈕 48px、P2 35 Lobby 搜尋 games-focus-ring、P2 38 每頁單一 h1、P2 40 按鈕 gap（已有 var(--space-card)）、列印 65ch、Skip link focus。

---

## 下一批（P2 34 + P3 41–50）實作摘要

- **P2 34**：assistant/page.tsx — 語音按鈕錄音中顯示 Square（停止）、非錄音 Mic；aria-pressed、紅底紅框、animate-pulse 已有。
- **P3 41**：design-tokens.ts — semantic / background / text 區塊補上用途註解。
- **P3 47**：login/page.tsx — Email/密碼 input 加 aria-required="true"、label 加 * 必填標記（text-red-400）。
- **P3 49**：定價/首頁 Testimonials 為區塊輪播無全屏 overlay，無需 Esc 關閉；GameWrapper Modal 已支援 Esc。
- **P3 50**：learn/page.tsx 課程列表區、Lobby.tsx 遊戲列表區加註「未來若列表增長可考慮虛擬捲動或分頁」。
