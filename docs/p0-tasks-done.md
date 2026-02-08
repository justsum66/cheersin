# P0 任務勾選 — 已實際完成實作

依 `cheersin_round2_full_500.md` R2-001～R2-030，僅列**已真實實作並可驗收**的項目。

| ID | 狀態 | 說明 |
|----|------|------|
| R2-001 | ✅ 已完成 | GameWrapper 已拆成 GameStateProvider、GameTimerProvider、GameSoundProvider 等，主檔 <300 行 |
| R2-003 | ✅ 已完成 | useUserStore、useSubscriptionStore、useGameStore 已建立；UserContext/useSubscription 改用 store |
| R2-004 | ✅ 已有 | 派對直播房：建立/加入、Realtime、選遊戲同步、乾杯（見 party-room、games/rooms API） |
| R2-005 | ✅ 已有 | AI 派對 DJ：POST /api/party-dj/plan、phases + gameIds + transitionText |
| R2-006 | ✅ 已有 | 劇本殺：scripts/script_chapters/script_roles、房間/角色/投票/懲罰、Realtime（見 script-murder） |
| R2-007 | ✅ 已有 | Playwright E2E critical-paths（登入、遊戲、訂閱路徑） |
| R2-013 | ✅ 已有 | next.config 含 CSP headers（Content-Security-Policy-Report-Only / 正式 CSP） |
| R2-015 | ✅ 已有 | Error Boundary（GameErrorBoundary、ErrorBoundaryBlock、global-error）+ Sentry |
| R2-018 | 🔶 部分 | api-error validationError + party-dj plan 使用；尚未全面 Zod 校驗 |
| R2-019 | ✅ 已完成 | src/lib/api-error.ts（AppError、handleApiError、validationError）；party-dj plan 使用 |
| R2-010 | ✅ 已有 | PayPal Webhook：ACTIVATED/CANCELLED/SALE.COMPLETED、驗簽、冪等、更新 profiles |
| R2-020 | ✅ 已有 | Supabase createBrowserClient（@supabase/ssr）內建 session 持久化與 refresh token 續期 |

其餘 R2-002、R2-008～009、R2-011～012、R2-014、R2-016～017、R2-021～030 為待辦或後續衝刺。
