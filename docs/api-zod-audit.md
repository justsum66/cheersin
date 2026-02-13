# SEC-003：API Zod 審計

## 集中 Schema（api-body-schemas.ts）

| Schema | 使用 Route | 狀態 |
|--------|------------|------|
| LeaveRoomBodySchema | POST /api/games/rooms/[slug]/leave | ✅ |
| JoinRoomBodySchema | POST /api/games/rooms/[slug]/join | ✅ |
| SubscriptionPostBodySchema | POST /api/subscription | ✅ |
| VerifyTurnstileBodySchema | POST /api/auth/verify-turnstile | ✅ |
| ChatPostBodySchema | POST /api/chat | ✅ |
| GamesRoomsPostBodySchema | POST /api/games/rooms | ✅ |
| GamesRoomsPatchBodySchema | PATCH /api/games/rooms/[slug] | ✅ |
| LearnProgressPostBodySchema | POST /api/learn/progress | ✅ |
| ScriptMurderPostBodySchema | POST /api/games/rooms/[slug]/script-murder | ✅ |
| RecommendPostBodySchema | POST /api/recommend | ✅ |
| ReportPostBodySchema | POST /api/report | ✅ |
| LearnNotesPostBodySchema | POST /api/learn/notes | ✅ |
| LearnCertificatePostBodySchema | POST /api/learn/certificate | ✅ |
| SubscriptionPromoPostBodySchema | POST /api/subscription/promo | ✅ |

## 路由內建 Schema（未集中）

| Route | Schema | 備註 |
|-------|--------|------|
| POST /api/party-dj/plan | PartyPlanSchema | 可考慮移至 api-body-schemas |
| POST /api/v1/party-dj/plan | PartyPlanSchema | 同上 |
| POST /api/party-dj/plans | PostBodySchema | 同上 |
| POST /api/v1/party-dj/plans | PostBodySchema | 同上 |
| POST /api/analytics | AnalyticsBodySchema | 同上 |

## 無 Body 或無 Zod 驗證之 API

| Route | 備註 |
|-------|------|
| GET 類 | 通常無 body，無需 Zod |
| POST /api/health | 無需 |
| POST /api/scripts/* | 待查 |
| POST /api/trivia/questions | 待查 |
| POST /api/truth-or-dare-external | 待查 |
| POST /api/webhooks/* | 通常以簽章驗證，非 Zod |

## 檢查結果

- [x] 主要 POST 路由已使用 safeParse
- [x] api-body-schemas 集中管理多數 schema
- [ ] 少數 party-dj、analytics 為路由內建 schema，可選集中

**更新日期**：2025-02-12
