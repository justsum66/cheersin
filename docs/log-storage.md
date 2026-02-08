# P2-368：日誌存儲與保留

- **輸出**：目前為 stdout/stderr，由 Vercel 或主機收集。
- **建議**：接 Logtail、Sentry、Datadog 等時，設定保留天數與存取權限；含 PII 的日誌須經脫敏（`maskSensitiveContext`）。
- **合規**：依 GDPR 等需求訂定保留政策並在隱私政策中說明。
