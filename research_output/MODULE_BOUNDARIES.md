# 模組邊界（FEATURE #30）

**產出**：2026-02-06。訂閱、遊戲、學院、助理 依賴清晰、可測。

| 模組 | 路由/入口 | 主要 lib | 依賴關係 |
|------|------------|----------|----------|
| 訂閱 | /pricing、/subscription、/subscription/success、/subscription/cancel | subscription.ts、subscription-lifecycle.ts、pricing.config | useSubscription、PayPalButton、api/subscription、webhooks/paypal |
| 遊戲 | /games、GameWrapper、Lobby | games-room.ts、games-favorites.ts、games-settings.ts、games.config | useGameRoom、useGameSound、api/games/rooms |
| 學院 | /learn、/learn/[courseId]、/learn/certificate | courses.ts、learn-bookmarks.ts、learn-notes.ts、learn-progress | LearnCourseContent、api 可選 |
| 助理 | /assistant | groq.ts、embedding.ts、wine-response.ts、chat-history-persist | api/chat、api/recommend、taiwan-wines |

- **訂閱**與 **助理** 交會：SubscriptionGate、CourseProTrialGate 限制次數；訂閱狀態由 useSubscription 讀取。
- **遊戲** 與 **訂閱** 交會：房間人數依 tier（getMaxRoomPlayers）；試玩局數。
- **學院** 與 **訂閱** 交會：CourseProTrialGate、課程解鎖。
- 共用：layout（Navigation、OfflineBanner、MaintenanceBanner）、config（errors、copy、toast）、components/ui。

測試：各模組有對應 lib/*.test.ts 或 __tests__；e2e 可依關鍵流程撰寫。
