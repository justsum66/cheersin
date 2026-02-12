# TypeScript any 計畫（TEST-005）

- **目標**：TypeScript strict 下無新增未註記的 `any`；既有 `any` 有計劃消除或註記。
- **作法**：`tsc --noEmit` 通過；新增程式碼避免 `any`，必要時使用 `unknown` 或明確型別。既有 `any` 可加 `// @ts-expect-error` 或 `// TODO: replace any with ...` 並列於本文件或 issue。
- **驗收**：CI 執行 `npm run build`（含 tsc）；any 僅於註記或例外處。
- **現狀**：本批審計 — build 通過；既有 `any` 見 codebase 註記或型別斷言處，依優先級逐項替換。
