# PayPal Webhook 優化與修復

- **無效 JSON**：POST body 先以 `JSON.parse` 解析，失敗則回傳 `400 INVALID_JSON`，避免 500 與 PayPal 重試風暴。
- **必要欄位**：解析後檢查 `event_type` 與 `resource` 存在，缺則 `400 INVALID_PAYLOAD`。
- **簽名驗證**：生產環境強制驗證、`PAYPAL_WEBHOOK_ID` 必填；開發環境可跳過驗證以便本地測試。
- **冪等**：以 `webhook_events.event_id` 記錄，重複則回 200 + `duplicate: true`，不重複寫入 DB。
- **事務**：`BILLING.SUBSCRIPTION.ACTIVATED` 使用 RPC `activate_subscription` 保證原子性。
