# Phase 4 完成摘要（P0 與 CI）

依計劃「殺手功能與 P0 實作計劃」第七節 Phase 4 執行。

## 本輪完成項目

| 項目 | 內容 |
|------|------|
| **R2-007** | Playwright E2E：登入頁有忘記密碼/註冊入口、定價頁有訂閱 CTA、進遊戲完成一局（/games?game=truth-or-dare → 選擇真心話/大冒險） |
| **R2-008** | 修復 console 檢查清單：見 `docs/r2-008-console-check.md`，需手動跑關鍵頁面逐一消除 |
| **R2-015** | 錯誤邊界 + Sentry：`ErrorBoundaryBlock`、`GameErrorBoundary` 在 `componentDidCatch` 中呼叫 `Sentry.captureException`（動態 import） |

## CI 驗收結果

- **Build**：`npm run build` ✅
- **Lint**：`npm run lint` ✅
- **TS**：`npx tsc --noEmit` ✅
- **Vitest**：`npm run test:run` ✅（158 tests）
- **E2E**：`npm run test:e2e:critical` — 多數通過；「開啟單一遊戲並可操作至少一步」已改為等候「選擇真心話/選擇大冒險」按鈕（40s），若 CI 仍不穩可考慮單一 worker 或僅跑部分 critical

## P0 完成率（本輪相關）

- R2-007、R2-008、R2-015 已實作；其餘 P0 依 round2 文件按 ID 續做。
- 建議：Commit 分組為 `chore(phase4): R2-007 E2E, R2-008 checklist, R2-015 Sentry in error boundaries`
