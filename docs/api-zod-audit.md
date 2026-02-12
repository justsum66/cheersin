# API Zod 校驗審計（SEC-003）

對應 TASKS-170 SEC-003：所有 API 輸入使用 Zod 校驗，無 raw body 信任。本文件列出 POST/PATCH 等具 request body 之路由與校驗狀態。

## 已使用 Zod 或等效 schema 的路由

| 路徑 | 校驗方式 |
|------|----------|
| /api/analytics | AnalyticsBodySchema.safeParse(raw) |
| /api/party-dj/plans | PostBodySchema.safeParse(raw) |
| /api/party-dj/plan | PlanBodySchema.safeParse(raw) |
| /api/games/rooms/[slug]/game-state | parsePartyStatePayload(payload)（Zod 於 party-state-schema） |

## 尚未使用 Zod 的路由（僅型別斷言或手動檢查）

以下路由使用 `request.json()` 後以 TypeScript 型別斷言或手動檢查，建議逐步補上 Zod schema.parse 或 safeParse：

| 路徑 | 現狀 |
|------|------|
| /api/games/rooms/[slug]/leave | body as { playerId? }，手動檢查 playerId |
| /api/subscription | body as SubscriptionPostBody |
| /api/games/rooms (POST) | body as GamesRoomsPostBody，.catch(() => null) |
| /api/auth/verify-turnstile | body as { token? } |
| /api/games/rooms/[slug]/join | body as GamesRoomJoinPostBody |
| /api/games/rooms/[slug] (PATCH) | body as { anonymousMode?, endRoom? } |
| /api/games/rooms/[slug]/script-murder | body 手動檢查 action |
| /api/chat | body as ChatPostBody |
| /api/report | body as ReportPostBody |
| /api/learn/progress | body as { courseId?, chapterId? } |
| /api/learn/notes | body 手動 |
| /api/learn/certificate | body 手動 |
| /api/recommend | body as RecommendPostBody |
| /api/subscription/promo | body as SubscriptionPromoPostBody |
| /api/admin/* | body 型別斷言 |
| 其餘 auth、push-subscribe、notifications、generate-invitation、auto-tag、chat/feedback、login-failure、notify-security 等 | 多為型別斷言或 JSON.parse |

## 驗收與下一步

- [ ] 關鍵路由（訂閱、join、leave、chat、game-state）已具 Zod 或等效；game-state、analytics、party-dj 已達標。
- [ ] 其餘路由依優先級（支付/訂閱 > 遊戲房間 > 其他）逐個補 schema.parse 或 safeParse，並回傳 400 + 統一錯誤格式。
- [ ] webhooks/paypal 使用 request.text() + JSON.parse 屬特例（簽章驗證後再 parse），可保留並註記於本文件。

**關鍵檔案**：`src/app/api/**/route.ts`、`@/types/api-bodies`、`@/lib/games/party-state-schema`。
