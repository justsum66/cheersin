# Test Batch 6 審計（TEST-011～020）

對應計畫「下一批 70 任務」Batch 6。

## TEST-011：訂閱與支付流程 E2E 或高覆蓋 mock

- **狀態**：訂閱流程有 `e2e/persona-flows/subscription.spec.ts`；支付可於 staging 或 mock（如 Stripe test mode）執行。可標註需 staging 環境。
- **驗收**：E2E 或高覆蓋 mock 通過。

## TEST-012：錯誤邊界與 fallback 有測試

- **狀態**：可選。ErrorFallback、ErrorBoundary 可補單元或 E2E 觸發錯誤路徑。
- **驗收**：可選。

## TEST-014：覆蓋率目標（關鍵路徑 statements > 70%）

- **狀態**：可選。可於 `vitest.config.ts` 啟用 `coverage`（`@vitest/coverage-v8`），CI 上傳 artifact；門檻可設於 CI 或文件。
- **驗收**：可選。

## TEST-015：E2E a11y axe 通過關鍵頁

- **狀態**：已實作。`e2e/a11y.spec.ts` 對首頁、Quiz、登入、定價、Games Lobby、learn 執行 axe，無 critical/serious。
- **驗收**：與 A11Y-013 一致。

## TEST-016：負載或簡單壓力測試

- **狀態**：可選。可於 scripts 或 k6/artillery 等補負載測試。
- **驗收**：可選。

## TEST-017：快照測試僅必要處

- **狀態**：避免過度；僅關鍵 UI 或穩定元件可考慮快照。
- **驗收**：可選。

## TEST-018：CI 完整流程文件與可重現

- **狀態**：`.github/workflows/ci.yml` 定義 lint → unit → build → E2E；與 CONTRIBUTING.md 一致。本地可 `npm run lint && npm run test:run && npm run build && npm run test:e2e`。
- **驗收**：與本地一致、可重現。

## TEST-019：PR 前檢查清單

- **狀態**：CONTRIBUTING.md 已列「提交 PR 前」：lint、test:run、build、可選 test:e2e。
- **驗收**：清單與 CI 對齊。

## TEST-020：Mock 策略文件

- **狀態**：訂閱/支付 E2E 可 mock API 或使用 Stripe test mode；關鍵 API 單元測試可 mock Supabase。可於本文件或 CONTRIBUTING 註明 mock 策略。
- **驗收**：可選文件化。

---

**關鍵檔案**：`e2e/a11y.spec.ts`、`e2e/persona-flows/subscription.spec.ts`、`vitest.config.ts`、`.github/workflows/ci.yml`、`CONTRIBUTING.md`、`src/__tests__/setup.ts`。
