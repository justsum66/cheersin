# P2-290：後端任務隊列 / Cron

**目標：** 耗時操作（郵件、報表、AI 分析）改為異步，不阻塞 API。

## 現有

- **Vercel Cron：** `app/api/cron/subscription-reminder/route.ts` — 訂閱到期提醒。
- **觸發：** 依 `vercel.json` 或 Vercel Dashboard 排程呼叫 GET。

## 擴充建議

- 新增 cron：如 `api/cron/cleanup-expired-rooms` 清理過期遊戲房。
- 發送郵件、生成報告：由 API 寫入隊列表或呼叫外部 Queue，再由 cron 或 worker 消費。
