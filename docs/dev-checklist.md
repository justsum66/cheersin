# DevOps 檢查清單（Phase 2）

對應 TASKS-170 Batch 6：DEV-001～007、DEV-010～012。

| ID | 項目 | 實作/驗收 |
|----|------|-----------|
| DEV-001 | lint 零錯誤零警告 | `npm run lint` 通過；或僅已接受規則 |
| DEV-002 | tsc --noEmit 通過 | 無型別錯誤 |
| DEV-003 | 生產 build 無錯誤 | `npm run build` 通過 |
| DEV-005 | 階段結束可 commit 與 push | 訊息符合約定（如 Phase 2 續：55 任務） |
| DEV-006 | pre-commit 或 CI 跑 lint | husky + lint-staged 已配置（package.json）；pre-commit 跑 next lint --fix |
| DEV-007 | CI 跑 test:run + build | .github/workflows/ci.yml：lint-and-unit（lint + test:run）、build |
| DEV-010 | Sentry 不洩漏敏感資訊 | 已過濾則註明（SENTRY 過濾 PII/token）；見 Sentry 設定 |
| DEV-011 | 建置與部署文件 | README 或 DEPLOYMENT；環境變數、建置步驟 |
| DEV-012 | CHANGELOG 或版本註記可維護 | 有則更新；本批見 TASKS-170 Phase 2 續完成紀錄 |
