# Contributing to Cheersin

感謝你有興趣參與 Cheersin 專案。以下為設置開發環境、提交變更與代碼風格的簡要說明。

## 開發環境設置

1. **依賴**：Node.js 18+，建議使用 LTS。
2. **克隆與安裝**：
   ```bash
   git clone https://github.com/justsum66/cheersin.git
   cd cheersin
   npm install
   ```
3. **環境變量**：複製 `.env.example` 為 `.env.local`，並填入必要變量（見 `.env.example` 註釋）。
4. **啟動**：
   ```bash
   npm run dev
   ```
   預設為 `http://localhost:3000`（或依 `PORT` 設定）。

## 代碼風格

- **Lint**：提交前請執行 `npm run lint`，並確保無錯誤。
- **TypeScript**：保持嚴格類型，避免 `any`；新程式碼需通過 `npm run build`（含 TS 檢查）。
- **命名**：組件與檔案命名請遵循 `docs/naming-conventions.md`。
- **Commit**：建議使用 [Conventional Commits](https://www.conventionalcommits.org/)（如 `feat:`, `fix:`, `docs:`）。

## 提交 PR 前（TEST-019 檢查清單）

1. 在功能分支上完成變更。
2. 執行 `npm run lint` 與 `npm run test:run`（可選 `npm run test:e2e` 或 `npm run test:e2e:chromium`）。**E2E 可選**：提交前可跑 `npm run test:e2e` 關鍵路徑，CI 已包含。
3. 確保 `npm run build` 通過。
4. （可選）執行 `npm run audit` 檢查依賴漏洞（SEC-014）；若有 high/critical 可先 `npm run audit:fix` 或於 PR 註明已知接受。
5. 填寫 PR 描述，並關聯相關 issue（若有）。

**CI 流程（TEST-018）**：與本地一致。`.github/workflows/ci.yml` 依序執行：lint → `npm run check:i18n:all` → unit tests → build → E2E。本地重現：`npm run lint && npm run check:i18n:all && npm run test:run && npm run build && npm run test:e2e`。**I18N-011**：關鍵路徑 E2E 已以 cookie `cheersin_locale=zh-TW` 與 `en` 各跑一輪（見 `e2e/critical-paths.spec.ts`）。訂閱/支付 E2E 可依環境使用 mock 或 staging（見 `docs/test-batch6-audit.md`）。

## 分支策略（DEV-014）

- **main**：生產就緒；CI 通過後部署。
- **develop**（可選）：整合分支，合併功能分支後再 merge main。
- **功能分支**：`feat/xxx`、`fix/xxx`、`docs/xxx`；自 main 或 develop 分出，PR 回目標分支。

PR 前請確認目標分支正確；維護者合併後依 CI 部署。

## 程式碼審查

- 維護者會對 PR 進行審查；請根據意見修改。
- 合併後會依 CI 流程進行部署與驗證。

如有疑問，可開 issue 或聯繫維護者。
