# P2-272：Visual Regression Testing

使用 Playwright 或 Chromatic 做 UI 截圖比對，可捕捉非預期視覺變更。

- **Playwright**：在 `e2e/visual/` 可新增 spec 使用 `page.screenshot()` 並與 baseline 比對（需自建比對邏輯或使用 `playwright-visual` 等）。
- **Chromatic**：若使用 Storybook，可整合 Chromatic 做元件級視覺回歸。
- **建議**：先對關鍵頁（首頁、定價、Quiz 結果）做少量 snapshot，再逐步擴大。
