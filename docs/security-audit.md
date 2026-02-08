# P2-352：定期安全審計計劃

建議每季執行一次安全檢視。

- **代碼審查**：針對 `app/api/`、`lib/`、auth 與支付相關邏輯做安全向的 code review。
- **依賴掃描**：`npm audit` 與（可選）Snyk/Dependabot，修復 high/critical。
- **滲透測試**：可採用 OWASP ZAP 或委外滲透，重點為登入、訂閱、Webhook、上傳（若有）。
- **紀錄**：審計結果與修復項目記錄於本檔或專用 wiki，便於追蹤。
