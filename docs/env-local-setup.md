# .env.local 設定（勿提交）

複製 `.env.example` 為 `.env.local` 後，依需要填入下列**實際值**（皆勿提交至 Git）：

- **OneSignal**：`ONESIGNAL_APP_ID`（見 .env.example 註解）、`ONESIGNAL_REST_API_KEY`（Dashboard → Settings → Keys）
- **Sentry**：`SENTRY_DSN`、`NEXT_PUBLIC_SENTRY_DSN`（兩者同值即可）
- **PayPal**：`PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET`（訂閱金流）
- **Supabase**：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`

設定完成後重啟 dev server。連線狀態可至 `/status` 查看即時結果。
