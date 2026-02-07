# 設計與 UX 審查 — 任務 61–70 執行狀態

**範圍**：DESIGN_UX_100_TASKS.md 第 61～70 個任務（P3×10）  
**狀態圖例**：✅ 已實作（審查確認）｜🔄 本次實作｜⏳ 待實作

---

## P3 — 任務 61–70

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 61 | 品牌字體 fallback | ✅ | layout next/font display: swap；globals --font-display 補 Georgia fallback、註解 |
| 62 | 數字 tabular-nums | ✅ | globals .tabular-nums、.text-price；pricing 價格已有；quiz 進度「第 x/y 題」加 tabular-nums |
| 63 | 列印隱藏裝飾 | ✅ | AuroraBackground / ParticleBubbles 已有 data-print-skip；globals @media print [data-print-skip] |
| 64 | Loading 品牌色 | ✅ | loading.tsx bg-primary-500/5、Skeleton bg-primary-500/10、skeleton-shimmer |
| 65 | 空狀態插畫 | ✅ | EmptyState 有 icon 區、CTA 48px；註解與 ErrorFallback 風格一致 |
| 66 | 錯誤碼對應文案 | ✅ | errors.config 429/503/500、getUserErrorMessage |
| 67 | 鍵盤快捷鍵提示 | ✅ | assistant 輸入區 title="Ctrl+Enter 送出"、頁腳「Ctrl+Enter 送出」 |
| 68 | RTL 預留 | ✅ | design-tokens 註解標註 RTL 預留（任務文件已標 ✅） |
| 69 | 高對比模式 | ✅ | globals @media (prefers-contrast: more) 邊框與對比（任務文件已標 ✅） |
| 70 | 動畫 reduced-motion 覆查 | ✅ | globals @media prefers-reduced-motion；各組件已有處理（任務文件已標 ✅） |

---

## 本次實作摘要

- **globals.css**：P3 61 — --font-display 補 Georgia fallback、註解 font-display: swap。
- **quiz/page.tsx**：P3 62 — 測驗進度「第 x/y 題」外層加 `<span className="tabular-nums">`。
- **EmptyState.tsx**：P3 65 — 註解 icon 與 ErrorFallback 風格一致。
