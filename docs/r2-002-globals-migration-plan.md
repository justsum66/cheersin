# R2-002：globals.css 遷移計劃

目標：80% 以上樣式遷移至 Tailwind Utility，僅保留 CSS 變數與少量全局重置，**<400 行**。

## 現狀

- `src/app/globals.css` 約 2000+ 行。
- 已含：`:root` 設計 token、`@layer base` 重置與語義、大量 `.games-*`、`.page-container-mobile`、`.safe-area-*`、主題切換等。

## 遷移策略

1. **保留**（不遷移）
   - `:root` 全部變數（--primary、--text-*、--space-*、--radius-* 等）。
   - `@tailwind base/components/utilities`。
   - 少量無法用 Tailwind 表達的（如 `body::after` / `body::before` 背景 pattern、noise）。
   - 高對比 / reduced-motion 等 `@media (prefers-*)` 覆寫（可擇要保留）。

2. **遷移至 Tailwind**
   - **Phase 1**：`.page-container-mobile`、`.touch-target`、`.safe-area-*` → 在 `tailwind.config` 擴充 `theme.extend` 或組件內直接用 `px-4 md:px-6 lg:px-8` + `env(safe-area-inset-*)` 工具類。
   - **Phase 2**：`.games-*`（.games-heading、.games-body、.games-btn-group、.games-card 等）→ 改為元件內 Tailwind 類名或 `@apply` 於單一 `components/games.css`（再逐步替換為 utility）。
   - **Phase 3**：表單、按鈕、glass 等重複區塊 → 元件級 class 或 design token 對應的 utility。

3. **驗收**
   - 行數 <400。
   - 視覺與行為與現有一致（RWD、主題、焦點環、無障礙不變）。

## 本輪已做

- 本文件建立；Phase 1/2/3 待依序執行。可先從刪除單一區塊並在對應組件改用 Tailwind 開始（例如首頁 Hero 已用 utility，可對照刪除 globals 中重複定義）。
