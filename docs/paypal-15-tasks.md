# PayPal 15 項優化任務

模組、功能、邏輯 — Webhook、訂閱 API、PayPalButton、subscription-lifecycle。

## 任務清單

| # | 狀態 | 說明 |
|---|------|------|
| PP-01 | ☐ | Webhook 冪等表（webhook_events）與重試策略（可選 retry 隊列） |
| PP-02 | ☐ | 更多 event_type：REFUNDED、PAYMENT.SALE.REFUNDED 等處理與 profiles 更新 |
| PP-03 | ☐ | 訂閱審計紀錄完整寫入 subscription_audit（old_status/new_status、tier、event_type） |
| PP-04 | ☐ | 錯誤分級與 logApiError 脈絡（requestId、event_type、user_id） |
| PP-05 | ☑ | PayPalButton 載入/錯誤/成功狀態與無障礙（aria-busy、aria-live、按鈕 label） |
| PP-06 | ☐ | 訂閱 API 與 useSubscription 同步時機（成功後 revalidate 或 refetch） |
| PP-07 | ☐ | subscription-lifecycle 與 cron 到期提醒串接（sendExpiryReminder 呼叫時機） |
| PP-08 | ☐ | 優惠碼驗證與套用流程（promo_codes 表或 config；結帳前驗證） |
| PP-09 | ☐ | 取消挽留邏輯與可選 UI（取消訂閱頁彈窗「下個月半價」或「暫停」） |
| PP-10 | ☐ | 發票/收據連結提供（PayPal 或訂閱管理頁顯示 invoice URL） |
| PP-11 | ☐ | 環境變數校驗（PAYPAL_CLIENT_ID、PAYPAL_CLIENT_SECRET、PAYPAL_WEBHOOK_ID）啟動或 API 回傳明確錯誤 |
| PP-12 | ☐ | 單元測試覆蓋 webhook route（ACTIVATED、CANCELLED、SALE.COMPLETED、簽名失敗） |
| PP-13 | ☐ | 單元測試覆蓋 subscription route（get/update、未登入、tier 回傳） |
| PP-14 | ☑ | 型別集中（api-bodies 或 types）：PayPalWebhookEvent、SubscriptionResponse |
| PP-15 | ☐ | 文件註解與 runbook：Webhook URL 設定、重試、常見錯誤碼 |
