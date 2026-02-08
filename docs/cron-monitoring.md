# P2-316：Cron Job 監控

後端定時任務（如訂閱到期提醒、過期房間清理）應可監控與告警。

- **現有 Cron**：`/api/cron/subscription-reminder`、Supabase Edge Function `cleanup-expired-rooms`。
- **建議**：
  1. 在 Vercel Dashboard 的 Cron 設定中確認執行紀錄與錯誤。
  2. 每次執行時寫入日誌（含開始/結束時間、影響筆數），便於在 Logtail/Sentry 查詢。
  3. 失敗時可發送 Slack/郵件告警（在 route 內 catch 後呼叫通知 API）。
