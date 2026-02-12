# E2E 關鍵路徑（critical-paths）

對應 `e2e/critical-paths.spec.ts`，用於 CI 或本地驗證核心轉換路徑。

## 建議執行方式

- **本地 / CI**：建議使用 **僅 Chromium** 以減少逾時與環境不穩：`npm run test:e2e:chromium`
- 全瀏覽器：`npm run test:e2e:critical`（會跑多 project，耗時較長，易遇 ECONNRESET）
- Playwright 預設：單 test timeout 60s、expect 15s（見 `playwright.config.ts`）

## 已知不穩項目（flaky）

- **定價 FAQ**：已改為以 `#faq` 區塊內第一個 button 點擊並先 dismiss cookie，避免依賴 FAQ 文案多語。
- **進遊戲（truth-or-dare）**：年齡門檻與 Cookie 需先關閉；Lobby 懶加載後需較長等待，若 50s 內按鈕未出現可能為 first-visit 或 Lobby 載入延遲。
- **派對 DJ**：表單送出後依賴 AI API 回傳，結果區可能超過 60s 才出現，環境或 API 慢時易逾時。
- **導航（主導航/底部導航）**：並行時偶發 element(s) not found，已放寬為可選英文 aria 或 .first()；若 ECONNRESET 導致頁面未完整載入會失敗。
- **I18N 多語**：已改為使用明確 baseURL 設定 cookie，通過率已提升。

## 驗收

- 通過：所有 critical-paths 的 test 綠燈
- 若逾時：關閉多餘 Node 行程後重跑，或僅跑 `test:e2e:chromium`
