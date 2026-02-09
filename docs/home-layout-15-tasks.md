# 首頁排版 15 項任務

依 UX、視覺、RWD、轉化率與無障礙，拆成 15 項可驗證的版面/排版任務（對應 HomePageClient + marketing page）。

| # | 視角 | 任務 | 狀態 |
|---|------|------|------|
| H1 | 容器 | 主內容區 max-w 與 padding 斷點統一（max-w-7xl / 1440px、px-4 sm:px-6） | ✅ |
| H2 | 視覺階層 | Hero 主標與副標字級差明確、副標 text-white/90 可讀 | ✅ |
| H3 | RWD | 360px 下 overflow-x-hidden、按鈕/連結 min 44px 觸控目標 | ✅ |
| H4 | 間距 | 區塊間 gap 一致、區塊內 space-y 統一 | ✅ |
| H5 | CTA | 主 CTA「開始靈魂酒測」唯一突出、次 CTA 為文字連結 | ✅ |
| H6 | Bento | Bento 卡片 grid 響應、卡片圓角與 focus-visible 一致 | ✅ |
| H7 | 信任區 | 社會證明/用戶數/評價區視覺群組 | ✅ |
| H8 | Footer | 單一 footer、網站地圖與法律連結分組、飲酒提醒可見 | ✅ |
| H9 | 訂閱區 | 訂閱表單與 CTA 區塊間距、錯誤/成功態 | ✅ 已驗（表單有 loading、成功 toast；mb-6 區塊間距） |
| H10 | 焦點 | focus-visible 環一致、主 CTA 可鍵盤到達 | ✅ |
| H11 | 字體 | 標題 font-display、內文/輔助 text-sm | ✅ |
| H12 | 動畫 | prefers-reduced-motion 時視差/動畫減量 | ✅ |
| H13 | 無障礙 | banner/region/aria-label、主 CTA aria-describedby | ✅ |
| H14 | 載入 | Suspense 有 fallback（評價/FAQ 骨架） | ✅ |
| H15 | 效能 | Hero 圖 priority/fetchPriority high、dev 時 analytics 不寫 DB 降 TTFB 影響 | ✅ |

**說明**：實作時對應 `src/components/home/HomePageClient.tsx` 與 `src/app/(marketing)/page.tsx`，逐項驗證後打勾。
