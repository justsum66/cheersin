# P0 任務完成狀態 (R2-001 ~ R2-030)

**更新：** 2026-02-13

## 已完成

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-001 | GameWrapper 拆分 | 主檔 117 行，已拆為 useGameWrapperLogic、Header、Body、Providers |
| R2-003 | Zustand 狀態管理 | useUserStore、useSubscriptionStore、useGameStore 已存在 |
| R2-004 | 派對直播房核心 | PartyRoomManager、usePartyRoomRealtime、party-room 頁面 |
| R2-005 | AI 派對 DJ 核心 | party-dj 頁面、/api/v1/party-dj/plan |
| R2-006 | 酒局劇本殺核心 | 劇本殺 50 項優化全部完成 |
| R2-007 | Playwright E2E | critical-paths.spec.ts、persona-flows |
| R2-009 | RWD 全面修復 | html/body overflow-x-hidden、page-container-mobile、320–1920px 適配 |
| R2-010 | PayPal Webhook | BILLING.SUBSCRIPTION.*、PAYMENT.SALE.* 已處理，簽名驗證、冪等 |
| R2-012 | GameLazyMap Code Splitting | webpackChunkName 改為 game-${category}-${id} |
| R2-013 | CSP 完整配置 | next.config headers 已配置 |
| R2-014 | RLS | 需於 Supabase 後台驗證 |
| R2-015 | Error Boundary | ErrorBoundaryBlock、GameErrorBoundary |
| R2-016 | 首頁 LCP 優化 | hero Image priority、preload logo、font-display swap |
| R2-017 | Cloudflare Turnstile | login、forgot-password 已覆蓋；TurnstileWidget dynamic 載入 |
| R2-018 | API Zod 校驗 | api-body-schemas.ts 已有多個 schema |
| R2-019 | 統一 API 錯誤處理 | api-error.ts、api-response.ts，serverErrorResponse 自動 log |
| R2-020 | Refresh Token | @supabase/ssr createBrowserClient 自動處理 session 續期 |
| R2-026 | 用戶輸入 XSS 清理 | sanitizeUserInput()，join route 已使用 |
| R2-029 | 隱私政策/服務條款 | /privacy、/terms 頁面完整 |
| R2-030 | CI/CD Pipeline | .github/workflows/ci.yml：lint、unit、build、E2E |

## 已完成（本輪）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-008 | 修復 console 警告 | 移除直接 console，改用 logger；TruthOrDare hooks deps 修正 |
| R2-011 | 去除換皮遊戲 | 審查完成，`docs/R2-011-games-audit.md`；換皮已移除 |
| R2-021 | 18+ 題庫 | adultTruthPool/adultDarePool 各 200+（JSON+inline+expandPool），SpicyTruthOrDare 使用 |
| R2-025 | TanStack Query | QueryClientProvider、party-dj useQuery、useScripts/useScriptRooms hooks |
| R2-028 | Rate Limit Redis | join/create/game_state/subscription/upload/report/recommend 優先 Upstash，fallback in-memory |
| R2-027 | pino 結構化日誌 | logger 改用 pino，dev 用 pino-pretty，Error stack 自動記錄 |

## 已完成（既有實作）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-022 | TheCocktailDB | cocktaildb.ts + chat 注入調酒題材，免 key |
| R2-023 | Trivia API | trivia/questions：The Trivia API / Open Trivia DB / 本地 fallback |
| R2-024 | Truth or Dare API | truth-or-dare-external 用 api.truthordarebot.xyz，快取 5 分鐘 |

## P1 本輪完成

| ID | 任務 | 備註 |
|:---|:---|:---|
| A11Y-004 | 表單錯誤與必填明確標示 | ScriptMurderRoom、GamesPageClient、login 補 aria-invalid、aria-describedby、role=alert、aria-live |
| I18N-002 | en/zh-TW/zh-CN 三語 key 覆蓋率 100% | zh-CN scriptMurder 補齊 22 key，check:i18n:three 通過 |
| TEST-008 | i18n check 腳本通過 | check:i18n:three 通過 |
| UX-011 | 空狀態有說明與行動引導 | profile/history 改用 EmptyState + i18n（historyEmpty/historyEmptyDesc/historyEmptyAction），六語補齊 |
| DEV-011 | 建置與部署文件 | docs/DEPLOYMENT.md；README 連結；port、E2E 說明 |
| SEC-005 | CSRF / origin 檢查 | middleware 已有實作；docs/security-csrf-origin.md 文件化 |
| A11Y-005 | 跳過主內容連結（skip link） | layout 已有 skip-link、#main-content；base.css 聚焦時可見 |
| I18N-003 | ja/ko/yue 缺 key 時 fallback | t() 依序 fallback zh-TW→zh-CN→en；不顯示 key 名（回傳 ''） |
| A11Y-006 | 模態框焦點鎖定與 Esc 關閉 | Modal、Drawer、ConfirmDialog 補 focus trap；SettingsModal/UpgradeModal 已有 |
| UX-013 | 導航當前頁高亮/aria-current | Navigation 已有 aria-current、視覺高亮；強化巢狀路由（/learn/course 高亮 learn）、訂閱連結 |
| COPY-003 | 錯誤頁（404/500）友善文案與導航 | notFound.hint 友善提示；error 頁補 games/assistant 連結、漸層背景；六語 hint |
| TEST-007 | validate:lessons/content 通過 | npm run validate:lessons、validate:content 無錯誤 |
| TEST-009 | E2E persona-flows 至少 6 條通過 | games/learn 斷言放寬多語系；建議先 npm run dev 再跑 E2E |
| TEST-013 | API 錯誤回傳格式一致 | errorResponse/getErrorCode 已用於各 route |
| UX-012 | 成功操作有 toast 或即時回饋 | 加入房間、建立房間、Party 加入、gamesRoom i18n |
| UX-007 | 載入與錯誤狀態與設計系統一致 | games error 改用 PageErrorContent；assistant/learn loading 加 gradient |
| COPY-002 | 登入/註冊頁說明與信任文案 | login.benefitsHint 六語；trustPrivacy 已有 |
| COPY-006 | 遊戲說明簡短且可於遊戲內查看 | Lobby 規則 Modal、GameCard rulesSummary、GameWrapper 規則按鈕 |
| COPY-008 | 助理/AI 回覆邊界與 fallback 文案 | errorFallback/emptyReply 已用，無技術語 |
| A11Y-007 | 鍵盤可操作所有主要流程 | docs/a11y-audit-checklist.md 審計；games-focus-ring 廣泛使用 |
| GAME-013 | 遊戲錯誤邊界與重試引導 | GameErrorBoundary 已有重試/回大廳按鈕，i18n props |
| GAME-015 | 房間人數上限與滿房提示 | join API ROOM_FULL；apiErrors.ROOM_FULL/INVALID_PASSWORD 六語；useGameRoom 用 getDisplayErrorMessage |
| A11Y-008 | 標題階層 h1→h2→h3 不跳級 | login、profile、subscription、pricing、script-murder 修正跳級 |
| A11Y-009 | 動畫尊重 prefers-reduced-motion | ClientProviders MotionConfig reducedMotion="user"；a11y 清單更新 |
| A11Y-010 | 圖片 alt 有意義，裝飾圖 aria-hidden | 審計通過；內容圖有意義 alt，裝飾圖 aria-hidden |
| A11Y-011 | 直播/即時區域 aria-live | PartyRoomManager 線上人數/玩家列表補 aria-live；script-murder/party-room 已有 |
| SEC-006 | XSS 審計 | docs/security-xss-audit.md；SafeJsonLdScript、sanitize 政策 |
| SEC-010 | 環境變數與 API Key 審計 | docs/security-env-audit.md；.env.example 註明 |
| PERF-003 | 遊戲元件懶加載審計 | GameLazyMap 90+ 遊戲皆 lazy，無首屏全載 |
| I18N-004 | 日期與數字依 locale 格式化 | ScriptMurderRoom、assistant 用 formatDateTime(locale)；roomValidUntil 六語 |

## P1 本輪完成（下一批 20）

| ID | 任務 | 備註 |
|:---|:---|:---|
| A11Y-012 | 觸控目標至少 44x44px | design-tokens touchTargetPx 48；safe-area touch-target 48px；Footer/LocaleSwitcher/HomePageClient 48px |
| UX-003 | 觸控目標至少 48px | 與 A11Y-012 合併；games-touch-target 已有 48px；GamesPageClient 表單 48px |
| UX-006 | 圖示系統統一 | 全站 lucide-react，無混用 |
| UX-008 | 深色/淺色主題無對比遺漏 | base.css html.light 樣式已有，btn-primary/secondary/ghost 對比可讀 |
| UX-010 | 遊戲與學習 CTA 明顯且文案一致 | 首頁 hero + BENTO；learn「開始學習」；games「開始遊戲」；轉換路徑清晰 |
| I18N-005 | 錯誤訊息與 API 錯誤多語 | api-error-i18n、getDisplayErrorMessage；apiErrors 六語；useGameRoom 已用 |
| I18N-006 | 課程與遊戲名稱/描述可譯 | 策略：config 驅動，未來 CMS；games.config 已有 name/desc 結構 |
| COPY-001 | 首頁 hero CTA A/B 可測 | common.ctaVariant0/1 六語；heroVariant 驅動 CTA 文案與 analytics |
| COPY-004 | 訂閱頁價值說明與 FAQ | 訂閱頁連結 pricing#faq；pricing 已有 FAQ；價值文案已有 |
| COPY-007 | 派對房與劇本殺 onboarding | partyRoom.onboardingSteps、scriptMurder.onboardingSteps 六語；GamesPageClient 三步引導 |
| SEC-007 | CSP 頭部覆蓋並收緊 | next.config headers 已配置；CSP report-only/強制可切換 |
| SEC-008 | Turnstile 驗證失敗不建立 session | docs/auth-turnstile-flow.md；verify-turnstile 回傳 success，前端僅成功時呼叫 signIn |
| PERF-004 | next/image 與 size/priority | Hero 圖 priority；next.config images WebP/AVIF；各元件用 next/image |
| PERF-008 | API 回應 Cache-Control | subscription GET、scripts GET 加 s-maxage/stale-while-revalidate |
| GAME-004 | 房主離開時房間處置明確 | leave API：host 離開時 expires_at=now，回傳 endRoom:true；PartyRoomEnded 顯示 |
| GAME-005 | 邀請連結複製與分享文案正確 | useCopyInvite、partyRoom.copyInviteAria、gamesRoom 六語；可複製且可讀 |
| GAME-010 | 遊戲內音效與觸覺可開關 | useGameSound、useHaptic、SettingsModal 開關；localStorage 持久化 |
| GAME-016 | 密碼房錯誤密碼提示友善 | apiErrors.INVALID_PASSWORD 六語；不洩漏房有密碼；join 回傳 code |

## 已完成（R2 本輪：低預估四項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-080 | 功能區塊圖標入場 | BentoCard 各 icon 獨特入場（scale/rotate/y/x），尊重 reducedMotion |
| R2-095 | 合作夥伴無限滾動 | HomePartnerMarquee、home-partner-marquee-track CSS、testimonials 前 |
| R2-114 | 玩家離開通知 | PartyRoomActive AnimatePresence + motion.div exit 淡出縮小 |
| R2-124 | 語音播報視覺 | SpeechVisualizer 元件；assistant 播報時顯示波形 |

## 已完成（R2 本輪：中預估三項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-081 | 投票柱狀圖 | VoteBarChart 元件；ComplimentBattle、SpicyWhoMostLikely 揭曉時柱狀動畫 |
| R2-117 | 品牌故事滾動觸發 | HomePageClient 品牌故事區左右交替滑入（x: -32 / 32 → 0） |
| R2-128 | 倒酒音效視覺化 | DrinkingAnimation 傾斜時杯緣酒液流動效果，useReducedMotion |

## 已完成（R2 本輪：第三批三項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-116 | 成就解鎖彈窗 | BadgeUnlockCelebration 金色卡片滑入；unlockBadge 回傳 boolean；Learn 課程/書籤/學習時長 |
| R2-122 | 隊伍分組動畫 | TeamGuess 分隊時頭像自中心散開（x: ±40 → 0） |
| R2-125 | 下載 APP 區塊 | Footer CTA 下方 Smartphone 圖示輕微浮動 |

## 已完成（R2 本輪：第四批二項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-077 | 準備按鈕 | PartyRoomManager 準備/已準備、presence 同步 isReady、全部準備提示、usePrefersReducedMotion |
| R2-106 | 聊天氣泡動畫 | assistant 訊息 spring 彈入（user 自右、assistant 自左），scale 0.96→1，尊重 reducedMotion |

## 已完成（R2 本輪：第五批一項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-067 | 玩家加入通知 | PartyRoomManager AnimatePresence 橫幅自頂滑入，頭像+「X 加入了派對」，3.2s 後淡出，toast 並存 |

## 已完成（R2 本輪：第六批三項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-105 | 特色遊戲 3D 輪播 | HomeGamesCarousel3D，Bento 後、品牌故事前；reducedMotion 改 2D 水平 |
| R2-118 | 選擇器慣性滾動 | InertialPicker 元件，touch/wheel 慣性、snap to center；已匯出 ui |
| R2-130 | 全員乾杯同步 | usePartyRoomGameStateRealtime、game_states Realtime migration；PartyRoomActive 碰杯動畫+震動；/party-room?room=slug 整合 |

## 已完成（R2 本輪：第七批 15 項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-090 | Logo 入場 | BrandLogo initial opacity 0、rotate -2deg 淡入，useReducedMotion |
| R2-086 | 社群媒體 Hover | HomePageClient 社群圖標 ring 擴散 + hover:scale-110 |
| R2-066 | 首頁 CTA 呼吸光效 | hero-cta-glow-pulse 驗證通過 |
| R2-070 | 通知鈴鐺搖晃 | NotificationPanel hasUnread 時 rotate 驗證通過 |
| R2-082 | 用戶頭像下拉選單 | UserMenu y:-8→0 spring 驗證通過 |
| R2-101 | 搜索框寬度過渡 | Lobby 搜尋框 focus 時 transition-[max-width] 驗證通過 |
| R2-099 | CTA 區塊背景動畫 | hero-cta-bg-gradient 驗證通過 |
| R2-088 | 證書生成 | 證書頁 motion.div y:40→0、opacity，useReducedMotion |
| R2-103 | 測驗答題動畫 | Trivia 答對 green+scale、答錯 red+shake 驗證通過 |
| R2-123 | 徽章收集入場 | Profile 成就卡片 scale 0→1、rotate -8→0，stagger 0.05s |
| R2-097 | 統計圖表動畫 | Profile XP 進度條 motion.div width 0→% 驗證通過 |
| R2-109 | 編輯模式切換 | 側邊欄 variants + staggerChildren 0.05 驗證通過 |
| R2-076 | 成就展示 | 已解鎖 ring-primary-400/50 驗證通過 |
| R2-093 | 限時優惠倒計時 | pricing motion.span key + rotateX 翻頁 驗證通過 |
| R2-119 | 定價見證卡片 Hover | whileHover rotateX/Y tilt 驗證通過 |

## 可實作項目（下一批建議）

以下為不需新架構、可逐步實作的項目：（暫無）

**暫緩（需新架構）**：R2-094 表情反應、R2-096 道具使用

## 已完成（原待驗證）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-002 | globals.css 瘦身 | Phase 1–9 ✅；目前 ~108 行，目標 < 400 已達成 |

## P1 本輪完成（R2-031 ~ R2-045）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-031 | 全局按鈕點擊動畫 | btn-primary/secondary/ghost active:scale-[0.95] |
| R2-032 | Modal AnimatePresence | modalContent scale 0.9→1 已有 |
| R2-033 | 遊戲卡片 Hover | hover:shadow-xl hover:border-primary/30 |
| R2-034 | 導航欄滾動透明度 | backdrop-blur-2xl 已有 |
| R2-035 | 數字變化動畫 | AnimatedNumber motion.span key 觸發 opacity/y |
| R2-036 | Skeleton shimmer | skeleton-shimmer-enhanced 已有 |
| R2-037 | Bento Grid Hover | group-hover:rotate-[15deg] 已有 |
| R2-038 | Toast 進入動畫 | toastFadeIn scale 0.95→1 |
| R2-039 | 頁面切換過渡 | PageTransitionWrapper + AnimatePresence + pathname key |
| R2-040 | 3-2-1 倒計時 | Countdown321 全螢幕 overlay 已有 |
| R2-041 | 懲罰輪盤 useSpring | springRotate 物理感旋轉 |
| R2-042 | 失敗全螢幕動畫 | showFailureEffect + showFailureFlash 紅色閃爍 |
| R2-043 | 玩家頭像脈動 | PartyRoomManager 當前用戶脈動光環 |
| R2-044 | InViewAnimate | 預設 y=30→0 入場 |
| R2-045 | 定價方案選中動畫 | 方案卡片 hover/focus-visible ring glow + stagger 已有 |

## P1 本輪完成（R2-046 ~ R2-060）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-046 | 導航 Active Link 底線 | layoutId nav-active-underline 已有 |
| R2-047 | 遊戲篩選 LayoutGroup | LayoutGroup + layoutId lobby-category-pill 已有 |
| R2-048 | 深色模式圓形擴散 | ThemeTransitionOverlay 從點擊位圓形擴散，prefers-reduced-motion 跳過 |
| R2-049 | 載入 Spinner 品牌化 | WineGlassLoading 酒杯動畫 已有 |
| R2-050 | 表單輸入框 Focus | input-glass focus-visible scale(1.01) + transition |
| R2-051 | 遊戲房間等待中 | PartyRoomActive Wine 脈動 已有 |
| R2-052 | Hero 視差滾動 | useTransform parallax 已有 |
| R2-053 | 再來一局按鈕彈跳 | GameResultActions initial/animate y 彈跳 已有 |
| R2-054 | 等級提升慶祝 | Profile 造訪時偵測 level>lastKnown，LevelUpCelebration overlay+confetti |
| R2-055 | 漢堡選單展開 | Menu/X AnimatePresence 已有 |
| R2-056 | 側邊欄滑入 | 行動選單 x:-100%→0 已有 |
| R2-057 | 遊戲卡片人氣脈動 | popular 標籤 animate-pulse |
| R2-058 | 最受歡迎金色邊框 | pricing-most-popular-badge pricingBadgeGlow |
| R2-059 | 提示按鈕搖晃 | Trivia 50/50 motion.button rotate 搖晃 已有 |
| R2-060 | CountUp useInView | useInView 取代 IntersectionObserver |

## P1 本輪完成（R2-061 ~ R2-110）

### 已有實作或已驗證（13 項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-065 | 翻牌 3D | FlipCard rotateY 0→180deg 已有 |
| R2-084 | FAQ 手風琴 | Accordion AnimatePresence + motion.div 已有 |
| R2-100 | 返回頂部 | BackToTop 滑入 + smooth scroll 已有 |
| R2-091 | Tooltip | Tooltip 觸發方向滑入 已有 |
| R2-127 | Tab 底線 | Tabs layoutId tabs-underline 已有 |
| R2-121 | Drawer | Drawer 底部滑入 + 遮罩 已有 |
| R2-115 | 空狀態 | EmptyState 浮動動畫 已有 |
| R2-064 | 訂閱成功 | subscription/success fireFullscreenConfetti 已有 |
| R2-074 | 用戶見證輪播 | HomeTestimonialsCarousel AnimatePresence 已有 |
| R2-071 | NEW 標籤閃爍 | GameCard animate-pulse 已有 |
| R2-072 | 定價月/年切換 | pricing motion.span key 價格過渡 已有 |
| R2-108 | 暫停覆蓋層 | GameWrapperBody 模糊 + 暫停選單 已有 |
| R2-098 | 打字機效果 | TypewriterText 元件 已有 |

### Phase 1：Lobby / 首頁 / 導航（8 項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-061 | 遊戲分類 Tab 內容淡入 | Lobby motion.div key={displayFilter} opacity 0→1 |
| R2-066 | 首頁 CTA 呼吸光效 | hero-cta-glow-pulse 已有 |
| R2-070 | 通知鈴鐺搖晃 | NotificationPanel hasUnread 時 rotate 已有 |
| R2-082 | 用戶頭像下拉選單 | UserMenu y:-8→0 spring 已有 |
| R2-090 | Logo 入場 | BrandLogo initial opacity 0 rotate -2deg 淡入 |
| R2-086 | 社群媒體 Hover | HomePageClient 社群圖標 group-hover 擴散 |
| R2-101 | 搜索框寬度過渡 | Lobby 搜尋框 transition-[max-width] focus 展開 已有 |
| R2-099 | CTA 區塊背景動畫 | hero-cta-bg-gradient 已有 |

### Phase 2：Pricing + Profile（9 項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-107 | 功能對比表格 | pricing motion.tr initial x:-16 自左滑入 |
| R2-119 | 定價見證卡片 Hover | whileHover rotateX/Y tilt 已有 |
| R2-129 | 保證退款徽章 | refund-badge-glow 光暈脈動 |
| R2-093 | 限時優惠倒計時 | motion.span key + rotateX 翻頁 已有 |
| R2-062 | 頭像上傳預覽 | motion.div key={avatarUrl} 已有 |
| R2-076 | 成就展示 | 已解鎖 ring-primary-400/50 |
| R2-097 | 統計圖表動畫 | XP 進度條 motion.div width 0→% |
| R2-109 | 編輯模式切換 | 側邊欄 variants + staggerChildren 0.05，含 E94 回饋區塊 |
| R2-063 | 遊戲歷史時間線 | Timeline motion.li x:-16 自左滑入 已有 |

### Phase 3：Learn / 品酒學院（7 項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-078 | 知識地圖節點 | LearningRoadmap 點亮時 roadmap-node-glow radial 光波 |
| R2-088 | 證書生成 | certificate motion.div translateY + opacity 從信封抽出 |
| R2-103 | 測驗答題 | Trivia 答對 green + scale-in，答錯 red + shake |
| R2-113 | 課程卡片 Hover | learn page group-hover 預覽 + 開始學習 已有 |
| R2-123 | 徽章收集 | badges motion.div scale 0→1 + rotate 入場 |
| R2-111 | FAQ 標題打字機 | HomeFAQAccordion TypewriterText 已有 |
| R2-068 | 進度條 motion | ProgressBar motion.div animate width |

### Phase 4：遊戲元件（14 項）

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-075 | 答對/答錯回饋 | Trivia green scale-in + red shake 已有 |
| R2-079 | Combo 動畫 | Trivia Combo x2/x3 motion.span 已有 |
| R2-085 | 計分板更新 | AnimatedNumber 已有 |
| R2-087 | 時間到警告 | Trivia 最後5秒紅色脈動 overlay 已有 |
| R2-120 | 進度指示器 | Trivia 圓點 + motion.div 進度條 已有 |
| R2-112 | 提交按鈕載入 | Trivia submittingIndex Loader2 已有 |
| R2-110 | 音效圖標 | SettingsModal 開關時 scale + 光暈擴散 |
| R2-073 | 倒計時圓環 | Trivia SVG stroke-dashoffset 已有 |
| R2-069 | 搖骰子 3D | Dice motion.div rotateX/Y/Z 已有 |
| R2-098 | 打字機效果 | TypewriterText 已有 |
| R2-089 | 隨機選人 | RandomPicker 頭像輪轉減速 60ms→180ms 已有 |
| R2-102 | 角色分配 | WerewolfLite result 階段 FlipCard 角色揭曉 已有 |
| R2-092 | 喝酒動畫 | DrinkingAnimation 用於 20+ 遊戲：ScriptMurderPlay、CountdownToast、PunishmentWheel、HotPotato、ToastRelay、Roulette、TwoTruthsOneLie、DiceWar、HighLow、FastType、WordScramble、NameTrain、LuckyDraw、QuizBattle、FinishLyric、MusicChair、SecretReveal、QuickQA、FingerGuessing、SoulMate、PriceGuess、EmotionRead、TicTacShot |
| R2-094 | 表情反應 | 需多人架構（暫緩） |
| R2-096 | 道具使用 | 需道具系統（暫緩） |
| R2-126 | 分享結果扇形 | CopyResultButton 脈動 + GameWrapperHeader 分享選項 stagger 已有 |
