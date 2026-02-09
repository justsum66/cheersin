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
| R2-018 | ✅ 本輪完成 | analytics、party-dj/plan 使用 Zod 校驗 body；回傳標準 400 |
| R2-019 | ✅ 已完成 | src/lib/api-error.ts（AppError、handleApiError、validationError）；party-dj plan 使用 |
| R2-010 | ✅ 已有 | PayPal Webhook：ACTIVATED/CANCELLED/SALE.COMPLETED、驗簽、冪等、更新 profiles |
| R2-020 | ✅ 已有 | Supabase createBrowserClient（@supabase/ssr）內建 session 持久化與 refresh token 續期 |
| R2-008 | ✅ 已有 | docs/console-audit.md 建立審計清單；逐頁修復時勾選 |
| R2-009 | ✅ 已有 | docs/rwd-verification.md 斷點 360/768/1920 驗證清單與已知修復 |
| R2-014 | ✅ 已有 | 所有 public 表 RLS 啟用；docs/rls-policies-audit.md 審計 |
| R2-016 | ✅ 已有 | layout 預載 logo_monochrome_gold.png (fetchPriority high)、LCP 優化 |
| R2-026 | ✅ 本輪完成 | report/chat 已有；games/rooms POST scriptId 使用 stripHtml 二次清理 |
| R2-029 | ✅ 已有 | 隱私政策含 Cookie 與第三方服務、資料收集、用戶權利；服務條款完整 |
| R2-030 | ✅ 已有 | .github/workflows/ci.yml：lint、unit test、build、E2E（PR 必過） |

| R2-002 | ✅ 已完成 | Phase1 已做；Phase2：.games-* 遷至 src/components/games/games.css，由根 layout 引入，globals 瘦身約 30 行 |
| R2-011 | ✅ 已完成 | 移除 5 款換皮遊戲（drinking-fist/captain-hook/count-seven/ultimate-code/support-front），與 finger-guessing/name-train/buzz-game/number-bomb/random-picker 合併；94 款保留 |
| R2-017 | ✅ 已完成 | Cloudflare Turnstile：react-turnstile、/api/auth/verify-turnstile、登入頁與忘記密碼頁整合；CSP frame-src；.env.example 新增 TURNSTILE 變數 |
| R2-021 | ✅ 已有 | truth-or-dare.ts adult 池 200+200（expandPool），SpicyTruthOrDare 付費解鎖 |
| R2-027 | ✅ 本輪完成 | analytics、report、party-dj/plan 使用 logger + requestId/durationMs |

| R2-024 | ✅ 本輪完成 | 整合 Truth or Dare 外部 API：/api/truth-or-dare-external、truth-or-dare.ts fetchExternalTruthDare、TruthOrDare 組件 mount 時拉取並與本地題庫合併 |
| R2-022 | ✅ 本輪完成 | TheCocktailDB 整合：lib/cocktaildb.ts、chat 偵測調酒意圖並注入 cocktailContext、侍酒師可引用配方 |
| R2-023 | ✅ 本輪完成 | Trivia 網路題庫：/api/trivia/questions 無 TRIVIA_API_KEY 時先試 Open Trivia DB，失敗再用本地題庫 |
| R2-025 | ✅ 本輪完成 | react-query 資料層：QueryClientProvider、useTriviaQuestions、usePartyDjPlan、Trivia 改用 useQuery |
| R2-028 | ✅ 本輪完成 | Upstash Redis 限流：rate-limit-upstash.ts、chat 有 UPSTASH 時用 Redis 限流（多實例一致） |

---

### 本輪已實作 P1（50 項，對應 round2 R2-031～R2-219）

| ID | 狀態 | 說明 |
|----|------|------|
| R2-031 | ✅ 已有 | 全局 whileTap（GameCard、Navigation、motion.button scale 0.95～0.98） |
| R2-032 | ✅ 已有 | Modal AnimatePresence + scale（UpgradeModal、PunishmentWheelModal） |
| R2-033 | ✅ 已有 | GameCard hover scale 1.03、shadow/border-primary |
| R2-036 | ✅ 已有 | 骨架屏 shimmer（globals.css、Skeleton） |
| R2-037 | ✅ 本輪完成 | Bento 卡片 hover 圖標旋轉 15deg + brightness |
| R2-038 | ✅ 已有 | Toast react-hot-toast |
| R2-046 | ✅ 本輪完成 | 導航 Active 滑動底線 layoutId nav-active-underline |
| R2-050 | ✅ 本輪完成 | 表單 focus 微放大 .input-focus-scale（globals.css） |
| R2-053 | ✅ 本輪完成 | 再來一局按鈕彈入動畫（GameResultActions motion.button） |
| R2-055 | ✅ 已有 | 導航漢堡選單 |
| R2-057 | ✅ 已有 | 遊戲卡「人氣」標籤 |
| R2-058 | ✅ 本輪完成 | 定價「最受歡迎」標籤脈動邊框 |
| R2-061 | ✅ 本輪完成 | Tab 切換內容淡入（Tabs.tsx key + motion） |
| R2-066 | ✅ 本輪完成 | 首頁 CTA 呼吸光效 .hero-cta-glow-pulse |
| R2-071 | ✅ 已有 | GameCard New 標籤 pulse |
| R2-072 | ✅ 本輪完成 | 定價月/年切換價格數字 motion.span 過渡 |
| R2-082 | ✅ 已有 | UserMenu 下拉 AnimatePresence + y 動畫 |
| R2-084 | ✅ 本輪完成 | 定價 FAQ 手風琴內容 motion 淡入 |
| R2-086 | ✅ 本輪完成 | 首頁 Footer 社群圖標 hover 品牌色 + scale |
| R2-090 | ✅ 已有 | 首頁 Logo 淡入 + scale（HERO_ANIMATION_DELAYS） |
| R2-100 | ✅ 已有 | BackToTop 滑入 |
| R2-127 | ✅ 已有 | Tabs 底線 layoutId tabs-underline |
| R2-129 | ✅ 本輪完成 | 定價保證退款徽章視覺強化 |
| R2-199 | ✅ 本輪完成 | 遊戲大廳付費遊戲皇冠（Lobby isPremium + GameCard Crown） |
| R2-207 | ✅ 本輪完成 | 定價頁「已有 X 人升級 Pro」社會認證 |
| R2-035 | ✅ 本輪完成 | 數字變化動畫：Trivia 得分與結果頁用 AnimatedNumber |
| R2-068 | ✅ 本輪完成 | 品酒學院課程卡進度條 motion 寬度動畫（第二處） |
| R2-075 | ✅ 本輪完成 | Trivia 答對/答錯即時回饋：Check/X 圖標 spring pop-in |
| R2-101 | ✅ 本輪完成 | 遊戲大廳搜尋框 focus 時寬度過渡（sm:max-w-sm → sm:max-w-md） |
| R2-107 | ✅ 本輪完成 | 定價功能對比表行入場 stagger（motion.tr + delay） |
| R2-119 | ✅ 本輪完成 | 定價用戶見證卡片 hover 3D tilt（perspective + rotateX/Y） |
| R2-121 | ✅ 本輪完成 | 全局 Drawer 組件（底部滑入 + 遮罩、Escape、焦點鎖定） |
| R2-126 | ✅ 本輪完成 | 分享結果按鈕脈動（CopyResultButton animate scale，尊重 prefersReducedMotion） |
| R2-219 | ✅ 本輪完成 | 取消訂閱頁「你將失去」Pro 權益清單挽留 |
| R2-040 | ✅ 本輪完成 | 遊戲開始 3-2-1 倒計時（Countdown321 overlay，reducedMotion 跳過） |
| R2-045 | ✅ 本輪完成 | 定價方案卡片入場 stagger（已有 delay，補註解） |
| R2-047 | ✅ 本輪完成 | 遊戲大廳分類 tab LayoutGroup + layoutId 選中底線平滑切換 |
| R2-049 | ✅ 本輪完成 | WineGlassLoading 訂閱成功頁載入態（inline 區塊用） |
| R2-059 | ✅ 本輪完成 | 猜謎王提示按鈕微晃動（motion.button rotate，尊重 reducedMotion） |
| R2-073 | ✅ 本輪完成 | Trivia 倒計時圓環 SVG（strokeDashoffset 隨 timeLeft 變化） |
| R2-099 | ✅ 本輪完成 | 首頁 CTA 區塊背景漸層動畫 .hero-cta-bg-gradient |
| R2-109 | ✅ 本輪完成 | 個人資料編輯模式切換動畫（AnimatePresence + motion.div key） |
| R2-110 | ✅ 本輪完成 | 音效開關圖標動畫（GameWrapperHeader 設定選單 Volume2/VolumeX + motion.span） |
| R2-112 | ✅ 本輪完成 | Trivia 提交答案按鈕載入態（spinner → 380ms 後勾/叉） |
| R2-120 | ✅ 本輪完成 | 多輪遊戲進度指示器（Trivia 圓點列 + 進度條） |
| R2-034 | ✅ 本輪完成 | 導航滾動透明度（已有 scrollY + navOpacity + backdrop-blur-2xl） |
| R2-044 | ✅ 本輪完成 | 劇本殺劇本列表區塊入場 InViewAnimate（y: 30, amount: 0.15） |
| R2-051 | ✅ 本輪完成 | 派對房「等待玩家加入」品牌化動畫（酒杯脈動 + 琥珀色橫幅） |
| R2-067 | ✅ 本輪完成 | 派對房玩家加入通知（fetchRoom 時 playerCount 增加則 toast.success） |
| R2-093 | ✅ 本輪完成 | 定價頁限時優惠倒數翻頁效果（motion.span key=秒數 + rotateX 動畫） |
| R2-102 | ✅ 本輪完成 | 劇本殺角色揭曉動畫（角色卡 rotateY 翻轉入場） |
| R2-103 | ✅ 本輪完成 | 品酒學院測驗答題動畫（正確 scale pop、錯誤 x 晃動） |
| R2-108 | ✅ 本輪完成 | 遊戲暫停覆蓋層動畫（AnimatePresence + 背景淡入、選單 spring 放大） |
| R2-043 | ✅ 本輪完成 | 當前輪到玩家頭像脈動（RiddleGuess 目前玩家 scale 脈動 + 高亮） |
| R2-042 | ✅ 本輪完成 | 遊戲失敗全螢幕動畫（Trivia 低分時結果區晃動 + 紅閃） |
| R2-056 | ✅ 本輪完成 | 行動選單從左側滑入（Navigation 漢堡選單 x: -100%→0） |
| R2-063 | ✅ 本輪完成 | 遊戲歷史時間線節點依次滑入（Timeline motion.li + delay） |
| R2-070 | ✅ 本輪完成 | 導航通知鈴鐺 hasUnread 支援（NotificationPanel 傳入，搖晃動畫已有） |
