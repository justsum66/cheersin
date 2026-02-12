# API Zod 校驗審計（SEC-003）

對應 TASKS-170 SEC-003：所有 API 輸入使用 Zod 校驗，無 raw body 信任。本文件列出 POST/PATCH 等具 request body 之路由與校驗狀態。

## 已使用 Zod 或等效 schema 的路由

| 路徑 | 校驗方式 |
|------|----------|
| /api/analytics | AnalyticsBodySchema.safeParse(raw) |
| /api/party-dj/plans | PostBodySchema.safeParse(raw) |
| /api/party-dj/plan | PlanBodySchema.safeParse(raw) |
| /api/games/rooms/[slug]/game-state | parsePartyStatePayload(payload)（Zod 於 party-state-schema） |

## 已補 Zod 的路由（SEC-003 本批）

| 路徑 | 校驗方式 |
|------|----------|
| /api/games/rooms/[slug]/leave | LeaveRoomBodySchema.safeParse(raw) |
| /api/games/rooms/[slug]/join | JoinRoomBodySchema.safeParse(raw) |
| /api/subscription | SubscriptionPostBodySchema.safeParse(raw) |
| /api/auth/verify-turnstile | VerifyTurnstileBodySchema.safeParse(raw) |
| /api/chat | ChatPostBodySchema.safeParse(raw) |
| /api/games/rooms (POST) | GamesRoomsPostBodySchema.safeParse(raw ?? {}) |
| /api/games/rooms/[slug] (PATCH) | GamesRoomsPatchBodySchema.safeParse(raw ?? {}) |
| /api/learn/progress | LearnProgressPostBodySchema.safeParse(raw ?? {}) |
| /api/games/rooms/[slug]/script-murder | ScriptMurderPostBodySchema.safeParse(raw) |
| /api/recommend | RecommendPostBodySchema.safeParse(raw) |
| /api/report | ReportPostBodySchema.safeParse(raw) |
| /api/learn/notes | LearnNotesPostBodySchema.safeParse(raw) |
| /api/learn/certificate | LearnCertificatePostBodySchema.safeParse(raw) |
| /api/subscription/promo | SubscriptionPromoPostBodySchema.safeParse(raw) |

Schema 定義於 `src/lib/api-body-schemas.ts`。

## 尚未使用 Zod 的路由（僅型別斷言或手動檢查）

以下路由使用 `request.json()` 後以 TypeScript 型別斷言或手動檢查，建議逐步補上 Zod schema.parse 或 safeParse。**優先級**：P3 = 其餘。

| 路徑 | 現狀 | 優先級 |
|------|------|--------|
| /api/admin/* | body 型別斷言 | P3 |
| 其餘 auth、push-subscribe、notifications、generate-invitation、auto-tag、chat/feedback、login-failure、notify-security 等 | 多為型別斷言或 JSON.parse | P3 |

## 驗收與下一步

- [x] 關鍵路由（訂閱、join、leave、chat、game-state）已具 Zod 或等效：subscription、join、leave、verify-turnstile、chat、games/rooms POST/PATCH、learn/progress 見「已補 Zod」；game-state 見 parsePartyStatePayload。
- [x] 其餘路由依優先級（P1 > P2 > P3）逐個補 schema.parse 或 safeParse，並回傳 400 + 統一錯誤格式；本批已完成 script-murder、recommend、report、learn/notes、learn/certificate、subscription/promo；尚未補見「尚未使用 Zod」表格（P3）。
- [x] webhooks/paypal 使用 request.text() + JSON.parse 屬特例（簽章驗證後再 parse），可保留並註記於本文件。

**關鍵檔案**：`src/app/api/**/route.ts`、`@/types/api-bodies`、`@/lib/games/party-state-schema`。
