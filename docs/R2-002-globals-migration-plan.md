# R2-002 globals.css 瘦身計畫

**目標：** 由 ~2500 行縮減至 < 400 行  
**策略：** 80% 以上樣式遷移至 Tailwind，僅保留 CSS 變數與極少全域重置

## 保留區塊（~150 行）

1. **:root** — 設計 token（色彩、字級、間距、radius）
2. **@layer base** — html/body 最小重置、:focus-visible
3. **scrollbar** — ::-webkit-scrollbar（無法用 Tailwind 表達）
4. **必要 @keyframes** — 若未在 tailwind.config 者

## 遷移目標

| 區塊 | 行數約 | 目標 |
|:---|:---:|:---|
| safe-area-* | ~30 | Tailwind plugin 或 @apply 工具類 |
| page-container-mobile | ~20 | 已部分在 games.css，其餘合併 |
| 首頁 .home-* | ~200 | 遷入 home 組件或 design-tokens |
| 學習 .learn-* | ~150 | 遷入 learn 組件 |
| 遊戲 .games-*、.game-* | ~300 | 已部分在 games.css，其餘遷入 |
| 通用 .modal-*、.toast-* | ~80 | Tailwind + 元件內聯 |
| 動畫 .animate-*、@keyframes | ~150 | tailwind.config keyframes |
| 其餘工具類 | 剩餘 | 依使用處遷入元件 |

## 執行順序

1. **Phase 1** ✅：Tailwind plugin 新增 safe-area、scrollbar-hide、page-container-mobile、carousel-track、games-focus-ring
   - `src/lib/tailwind-plugins/safe-area-utilities.ts`
   - globals.css 約 2500 → 2418 行（-82）
2. **Phase 2** ✅：首頁專用樣式 → `src/components/home/home.css`
   - 2418 → 2230 行（-188）
3. **Phase 3** ✅：學習/測驗專用 → `learn/learn.css`、`quiz/quiz.css`
   - 2230 → 2200 行（-30）
4. **Phase 4** ✅：遊戲剩餘 → `games.css`（games-content、lobby-region、game-btn-*、game-main、game-list）
   - 2200 → 2063 行（-137）
5. **Phase 5** ✅：共用 UI 樣式 → `src/styles/shared.css`
6. **Phase 6** ✅：@layer components → `src/styles/components.css`（container-desktop、glass-card、buttons、inputs、forms 等）
7. **Phase 7** ✅：@layer utilities、keyframes、animate-* → `src/styles/utilities.css`
   - bento-grid、card-3d、glass-2、interact-scale、container-2xl、divider-gradient、icon-*、scroll-progress、progress-bar-fill、pro-gradient-border、text-fluid-*、dark img、RTL
   - 2063 → 1869 行（-194）
8. **Phase 8** ✅：@media print → `src/styles/print.css`（-81 行，556 行）
9. **Phase 9** ✅：@layer base → `src/styles/base.css`（html/body、scrollbar、typography、主題、high-contrast、skip-link；-448 行）
   - 最終 globals.css：**108 行**，目標 < 400 已達成
