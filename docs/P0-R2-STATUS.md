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

## 待完成或需驗證

| ID | 任務 | 備註 |
|:---|:---|:---|
| R2-002 | globals.css 瘦身 | Phase 1–9 ✅；目前 108 行，目標 < 400 已達成 |
