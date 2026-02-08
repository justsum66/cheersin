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
| R2-008 | ✅ 已有 | docs/console-audit.md 建立審計清單；逐頁修復時勾選 |
| R2-009 | ✅ 已有 | docs/rwd-verification.md 斷點 360/768/1920 驗證清單與已知修復 |
| R2-014 | ✅ 已有 | 所有 public 表 RLS 啟用；docs/rls-policies-audit.md 審計 |
| R2-016 | ✅ 已有 | layout 預載 logo_monochrome_gold.png (fetchPriority high)、LCP 優化 |
| R2-026 | ✅ 已有 | report API 使用 stripHtml 清理 description；chat 已有 sanitizeUserInput |
| R2-029 | ✅ 已有 | 隱私政策含 Cookie 與第三方服務、資料收集、用戶權利；服務條款完整 |
| R2-030 | ✅ 已有 | .github/workflows/ci.yml：lint、unit test、build、E2E（PR 必過） |

| R2-002 | 🔶 計劃中 | docs/r2-002-globals-migration-plan.md 已建立；目標 <400 行、80% 遷 Tailwind，分階段執行 |
| R2-011 | ✅ 已完成 | 移除 5 款換皮遊戲（drinking-fist/captain-hook/count-seven/ultimate-code/support-front），與 finger-guessing/name-train/buzz-game/number-bomb/random-picker 合併；94 款保留 |
| R2-017 | ✅ 已完成 | Cloudflare Turnstile：react-turnstile、/api/auth/verify-turnstile、登入頁與忘記密碼頁整合；CSP frame-src；.env.example 新增 TURNSTILE 變數 |

其餘 R2-021～028 為待辦或後續衝刺。

---

### 本輪已實作 P1（10 項，對應 round2 R2-031～R2-100）

| ID | 狀態 | 說明 |
|----|------|------|
| R2-031 | ✅ 已有 | 全局 whileTap（GameCard、Navigation、多款遊戲 motion.button scale 0.95～0.98） |
| R2-033 | ✅ 已有 | GameCard hover：scale 1.03、group-hover shadow/border-primary |
| R2-036 | ✅ 已有 | 骨架屏 shimmer（globals.css @keyframes shimmer、Skeleton skeleton-shimmer-enhanced） |
| R2-071 | ✅ 本輪完成 | GameCard「New」標籤：`animate-[pulse_2s_ease-in-out_infinite]` |
| R2-100 | ✅ 本輪完成 | BackToTop：AnimatePresence + motion.button 從右下角滑入 (y: 24→0, opacity) |
| R2-032 | ✅ 已有 | Modal 使用 AnimatePresence + initial/exit scale（UpgradeModal、PunishmentWheelModal 等） |
| R2-057 | ✅ 已有 | 遊戲卡「人氣」標籤（Badge variant，與 New 並存） |
| R2-055 | ✅ 已有 | 導航漢堡選單（Navigation 行動版） |
| R2-038 | ✅ 已有 | Toast 使用 react-hot-toast（內建動畫） |
| R2-046 | 🔶 部分 | 導航 active 以 className 區分，尚未 layoutId 滑動底線 |
