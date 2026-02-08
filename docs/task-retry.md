# P2-325：後端任務重試

異步任務（如發送郵件、呼叫外部 API）建議帶指數退避重試。

- **現有**：`src/lib/retry.ts` 提供 `fetchWithRetry`，用於 HTTP 請求；可擴充為通用 `withRetry(fn, options)`。
- **建議**：重試次數 3、延遲 500ms * 2^attempt；僅對 5xx 或網路錯誤重試，4xx 不重試。
- **Cron**：訂閱提醒等 Cron 內若呼叫外部服務，可包一層 retry 再寫 DB。
