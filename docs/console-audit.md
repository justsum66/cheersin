# Console 審計（R2-008 對應）

P0 R2-008：修復所有 console.error / console.warn，開發模式下控制台無紅/黃警告。

## 策略

1. **允許的 log**：`logger.*` 或明確標記為除錯用的 `console.log`（上線前可改為 logger 或移除）。
2. **需修復**：React hydration mismatch、missing key、deprecated API、未處理的 promise rejection。
3. **本輪**：建立審計清單，逐模組修復時勾選。

## 常見來源

| 類型 | 處理方式 |
|------|----------|
| Hydration mismatch | 確保 server/client 同構或使用 suppressHydrationWarning / 動態載入 |
| Missing key | 為 list 項加上穩定 key（id 或 index 僅在靜態列表） |
| Deprecated API | 替換為新 API（如 React 18 的 createRoot） |
| 未捕獲 promise | 加上 .catch() 或 try/await |

## 審計狀態

- [ ] 首頁（/）
- [ ] 遊戲列表（/games）
- [ ] 單一遊戲頁
- [ ] 助理（/assistant）
- [ ] 品酒學院（/learn）
- [ ] 定價（/pricing）
- [ ] 登入/註冊流程

修復時更新本清單並在 PR 註明「R2-008」。
