# Cheersin REPO 完整審查報告

> 審查日期：2026-02-15
> 審查工具：Matrix Agent

---

## 1. 檔案統計

| 項目 | 數量 |
|------|------|
| **總源代碼檔案** | ~1,170 個 (排除 node_modules) |
| **TypeScript (.ts)** | 314 個 |
| **React 組件 (.tsx)** | 486 個 |
| **JSON 配置** | 95 個 |
| **測試檔案** | ~50 個 (專案內) |
| **SQL 遷移** | 36 個 |
| **總代碼行數** | ~98,560 行 |

### 檔案類型分布

```
.tsx    486 個  (React 組件/頁面)
.ts     314 個  (TypeScript 模組)
.json    95 個  (配置/翻譯)
.png     89 個  (圖片資源)
.md      45 個  (文檔)
.sql     36 個  (資料庫遷移)
.webm    35 個  (影片資源)
.css     10 個  (樣式表)
```

---

## 2. 目錄結構

```
cheersin/
├── .husky/              # Git hooks (husky)
├── api-docs/            # API 文檔
├── data/                # 靜態數據
├── docs/                # 專案文檔
├── e2e/                 # E2E 測試 (Playwright)
├── messages/            # i18n 翻譯檔案
├── public/              # 靜態資源 (72 個檔案)
│   ├── *.png           # 55 個圖片
│   ├── *.json           # 9 個 (manifest 等)
│   ├── *.svg            # 5 個圖標
│   └── sw.js            # Service Worker
├── scripts/             # 建構/部署腳本
├── src/                 # 主要源代碼
│   ├── app/            # Next.js App Router 頁面
│   ├── components/     # React 組件
│   ├── config/         # 應用配置
│   ├── hooks/          # 自定義 Hooks
│   ├── lib/            # 工具函數
│   ├── store/          # Zustand 狀態管理
│   └── types/          # TypeScript 類型
├── supabase/            # Supabase 配置與遷移
└── test-reports/        # 測試報告
```

---

## 3. 配置檔案分析

### 3.1 package.json

**專案名稱**: cheersin v1.0.0

**主要依賴** (23 個):
| 依賴 | 版本 | 用途 |
|------|------|------|
| next | 15.5.7 | React 框架 |
| react | ^19.0.0 | UI 庫 |
| @supabase/supabase-js | ^2.45.0 | 後端服務 |
| @tanstack/react-query | ^5.90.20 | 數據請求 |
| zustand | ^5.0.0 | 狀態管理 |
| framer-motion | ^12.31.1 | 動畫 |
| zod | ^4.3.6 | Schema 驗證 |
| groq-sdk | ^0.8.0 | AI Chat |
| @sentry/nextjs | ^10.38.0 | 錯誤監控 |
| @upstash/ratelimit | ^2.0.8 | 速率限制 |
| lucide-react | ^0.469.0 | 圖標 |

**開發依賴** (19 個):
- vitest ^2.1.0 (單元測試)
- @playwright/test ^1.58.1 (E2E 測試)
- @testing-library/react ^16.0.0 (React 測試)
- typescript ^5.7.0
- tailwindcss ^3.4.17
- eslint ^9.17.0
- husky ^9.1.7 (Git hooks)

**Scripts**:
```json
"dev": "next dev --turbopack"       // 開發 (Turbopack)
"build": "next build"               // 生產建構
"test": "vitest"                    // 單元測試
"test:e2e": "playwright test"       // E2E 測試
"lint": "next lint"                 // 代碼檢查
```

### 3.2 tsconfig.json

- **Target**: ES2017
- **Module**: ESNext (bundler resolution)
- **嚴格模式**: 啟用
- **路徑別名**: `@/*` → `./src/*`
- **JSX**: preserve (由 Next.js 處理)

### 3.3 tailwind.config.ts

- **Content**: 掃描 `src/components/` 和 `src/app/`
- **自定義動畫**: float, glow, shimmer, aurora 等 12 種
- **設計令牌**: 從 `src/lib/design-tokens` 引入
- **插件**: safe-area-utilities (PWA 安全區域)

### 3.4 next.config.ts

**關鍵配置**:
- **React Strict Mode**: 啟用
- **圖片優化**: WebP/AVIF 格式，遠端圖片白名單
- **Bundle 分析**: `ANALYZE=true` 時啟用
- **Webpack 優化**:
  - Vendor chunks 分離 (react, next, supabase, ui, icons)
  - Filesystem cache (生產)
- **安全標頭**:
  - CSP (Content Security Policy)
  - HSTS (生產環境)
  - X-Frame-Options: SAMEORIGIN
  - Permissions-Policy
- **Server Actions**: 2MB body 限制
- **Sentry 集成**: 錯誤監控

### 3.5 .env.example

**必填變數**:
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` (Chat 主線)
- `OPENROUTER_API_KEY` (Embedding + Chat fallback)
- `PINECONE_API_URL` / `PINECONE_API_KEY` (向量庫)

**選填變數**:
- `NVIDIA_NIM_API_KEY` (Chat fallback)
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` (訂閱)
- `RESEND_API_KEY` (Email)
- `UPSTASH_REDIS_REST_URL` (分散式限流)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare 驗證)
- `SENTRY_DSN` (錯誤監控)

---

## 4. 頁面分析 (src/app/)

共 **121 個 .tsx 檔案**，主要頁面:

### 4.1 核心頁面

| 路徑 | 檔案大小 | 功能描述 |
|------|----------|----------|
| `/` | (marketing)/page.tsx | 首頁/Landing Page |
| `/quiz` | 71,987 bytes | 靈魂酒測 (核心功能) |
| `/assistant` | 42,476 bytes | AI 品酒助理 |
| `/learn` | 131,458 bytes | 學習中心 (最大頁面) |
| `/pricing` | 41,444 bytes | 定價方案 |
| `/party-dj` | 27,112 bytes | 派對 DJ |
| `/login` | 24,055 bytes | 登入/註冊 |

### 4.2 遊戲相關

| 路徑 | 功能 |
|------|------|
| `/games` | 遊戲大廳 |
| `/games/create` | 創建遊戲房間 |
| `/games/tournament` | 比賽模式 |
| `/games/tools/soundboard` | 音效板工具 |
| `/games/tools/scoreboard` | 記分板工具 |
| `/party-room` | 派對房間 |
| `/script-murder` | 劇本殺遊戲 |

### 4.3 學習相關

| 路徑 | 功能 |
|------|------|
| `/learn/[courseId]` | 課程詳情 |
| `/learn/certificate` | 證書系統 |
| `/learn/knowledge` | 知識庫 |
| `/learn/glossary` | 術語表 |
| `/learn/wines` | 葡萄酒百科 |
| `/learn/pairing` | 餐酒搭配 |
| `/learn/regions` | 產區介紹 |
| `/learn/flavor-wheel` | 風味輪 |

### 4.4 用戶相關

| 路徑 | 功能 |
|------|------|
| `/profile` | 個人檔案 |
| `/profile/history` | 遊戲歷史 |
| `/profile/security` | 安全設定 |
| `/subscription` | 訂閱管理 |
| `/auth/forgot-password` | 忘記密碼 |
| `/auth/set-password` | 設定密碼 |

### 4.5 管理後台

| 路徑 | 功能 |
|------|------|
| `/admin/users` | 用戶管理 |
| `/admin/usage` | 使用統計 |
| `/admin/knowledge` | 知識庫管理 |

---

## 5. 組件分析 (src/components/)

共 **356 個 .tsx 組件**

### 5.1 遊戲組件 (games/) - 150+ 個

**核心遊戲**:
| 組件 | 大小 | 描述 |
|------|------|------|
| GamesPageClient.tsx | 53,856 bytes | 遊戲大廳客戶端 |
| Lobby.tsx | 45,722 bytes | 遊戲大廳 |
| NeverHaveIEver.tsx | 38,048 bytes | 我從未 |
| Trivia.tsx | 32,298 bytes | 問答遊戲 |
| TruthOrDare.tsx | 31,632 bytes | 真心話大冒險 |
| WhoMostLikely.tsx | 29,619 bytes | 誰最可能 |
| KingsCup.tsx | 26,031 bytes | 國王遊戲 |
| Roulette.tsx | 25,181 bytes | 輪盤 |
| Dice.tsx | 23,865 bytes | 骰子遊戲 |

**面對面遊戲** (FaceToFace/):
- WhoIsUndercover.tsx (臥底遊戲)
- WerewolfLite.tsx (狼人殺精簡版)
- HeartbeatChallenge.tsx (心跳挑戰)
- WouldYouRather.tsx (你願意嗎)
- Charades.tsx (比手畫腳)

**懲罰系統** (Punishments/):
- PunishmentWheel.tsx (懲罰輪盤)
- PunishmentWheelModal.tsx
- PunishmentContext.tsx

### 5.2 學習組件 (learn/) - 40+ 個

| 組件 | 大小 | 描述 |
|------|------|------|
| LearnCourseContent.tsx | 106,476 bytes | 課程內容 (最大組件) |
| WhiskyRecommendationDatabase.tsx | 30,791 bytes | 威士忌推薦 |
| WineRecommendationDatabase.tsx | 28,683 bytes | 葡萄酒推薦 |
| InteractiveCocktailMap.tsx | 33,132 bytes | 互動雞尾酒地圖 |
| SeasonalCocktailGuide.tsx | 25,995 bytes | 季節雞尾酒指南 |
| SeasonalBeerCiderGuide.tsx | 26,243 bytes | 季節啤酒指南 |

### 5.3 UI 組件 (ui/) - 60+ 個

**基礎組件**:
- Button.tsx, Input.tsx, Badge.tsx
- Modal.tsx, Drawer.tsx, Tooltip.tsx
- Tabs.tsx, Accordion.tsx, Switch.tsx
- Avatar.tsx, Skeleton.tsx, Carousel.tsx

**進階組件**:
- InertialPicker.tsx (慣性選擇器)
- FontSizeControl.tsx (字體大小控制)
- PronunciationButton.tsx (發音按鈕)
- ImageLightbox.tsx (圖片燈箱)
- ConfirmDialog.tsx (確認對話框)

### 5.4 首頁組件 (home/) - 20+ 個

- HeroSection.tsx (英雄區)
- FeaturesSection.tsx (功能區)
- HomeTestimonials.tsx (用戶評價)
- HomeFAQ.tsx (常見問題)
- HomeFooter.tsx (頁尾)
- HomePartnerMarquee.tsx (合作夥伴跑馬燈)

### 5.5 助理組件 (assistant/) - 6 個

- AssistantInputBar.tsx (輸入欄)
- AssistantMessageBubble.tsx (訊息氣泡)
- AssistantHistorySidebar.tsx (歷史側欄)
- AssistantHeader.tsx
- AssistantWelcome.tsx
- MarkdownMessage.tsx

---

## 6. 工具函數分析 (src/lib/)

共 **108 個 .ts 檔案** (含 28 個測試檔案)

### 6.1 核心工具

| 檔案 | 大小 | 功能 |
|------|------|------|
| groq.ts | 14,918 bytes | Groq AI 集成 |
| truth-or-dare.ts | 15,996 bytes | 真心話大冒險邏輯 |
| gamification.ts | 11,364 bytes | 遊戲化系統 |
| rate-limit.ts | 7,533 bytes | 速率限制 |
| api-body-schemas.ts | 8,817 bytes | API Schema 驗證 |
| courses.ts | 6,500 bytes | 課程系統 |
| subscription.ts | 6,137 bytes | 訂閱管理 |

### 6.2 資料庫/後端

| 檔案 | 功能 |
|------|------|
| supabase.ts | Supabase 客戶端 |
| supabase-server.ts | 服務端 Supabase |
| pinecone.ts | Pinecone 向量庫 |
| embedding.ts | 文字嵌入 |
| openrouter.ts | OpenRouter API |
| nim.ts | NVIDIA NIM API |

### 6.3 遊戲邏輯

| 檔案 | 功能 |
|------|------|
| truth-or-dare.ts | 真心話大冒險 |
| never-have-i-ever.ts | 我從未 |
| who-most-likely.ts | 誰最可能 |
| would-you-rather.ts | 你願意嗎 |
| secret-reveal.ts | 秘密揭曉 |

### 6.4 工具/輔助

| 檔案 | 功能 |
|------|------|
| formatters.ts | 格式化工具 |
| validators.ts | 驗證器 |
| sanitize.ts | 資料清理 |
| fetch-retry.ts | 重試機制 |
| storage.ts | 本地存儲 |

### 6.5 i18n

| 檔案 | 功能 |
|------|------|
| i18n/messages.ts | 訊息載入 |
| i18n/config.ts | 語言配置 |
| i18n/server-meta.ts | 服務端元數據 |

---

## 7. Hooks 分析 (src/hooks/)

共 **37 個自定義 Hooks**

### 7.1 遊戲相關

| Hook | 大小 | 功能 |
|------|------|------|
| useGameRoom.ts | 11,755 bytes | 遊戲房間管理 |
| useTournament.ts | 11,800 bytes | 比賽模式 |
| useAssistantChat.ts | 13,344 bytes | AI 聊天 |
| useGameLogic.ts | 7,992 bytes | 遊戲邏輯 |
| useGameSound.ts | 7,527 bytes | 遊戲音效 |
| useScriptMurderRoom.ts | 6,747 bytes | 劇本殺房間 |
| useScriptMurderState.ts | 6,144 bytes | 劇本殺狀態 |

### 7.2 UI/UX 相關

| Hook | 功能 |
|------|------|
| useHaptic.ts | 觸覺反饋 |
| useDebounce.ts | 防抖 |
| useThrottle.ts | 節流 |
| useLocalStorage.ts | 本地存儲 |
| useFocusTrap.ts | 焦點陷阱 |
| usePrefersReducedMotion.ts | 減少動畫偏好 |
| useKeyboardShortcuts.ts | 鍵盤快捷鍵 |
| useLazyLoad.ts | 懶加載 |

### 7.3 數據相關

| Hook | 功能 |
|------|------|
| useSubscription.ts | 訂閱狀態 |
| useProfileData.ts | 個人資料 |
| useWishlist.ts | 願望清單 |
| useLimits.ts | 使用限制 |
| useSupabase.ts | Supabase 客戶端 |

### 7.4 即時通訊

| Hook | 功能 |
|------|------|
| usePartyRoomRealtime.ts | 派對房間即時更新 |
| useScriptMurderRealtime.ts | 劇本殺即時更新 |
| usePartyRoomGameStateRealtime.ts | 遊戲狀態即時更新 |

---

## 8. 狀態管理分析 (src/store/)

使用 **Zustand** 進行狀態管理，共 **4 個 Store** (+ 4 個測試檔案)

| Store | 大小 | 功能 |
|-------|------|------|
| useGameStore.ts | 4,929 bytes | 遊戲全局狀態 |
| usePartyStore.ts | 2,201 bytes | 派對房間狀態 |
| useUserStore.ts | 1,435 bytes | 用戶狀態 |
| useSubscriptionStore.ts | 1,081 bytes | 訂閱狀態 |

**測試覆蓋**: 每個 Store 都有對應的測試檔案

---

## 9. API 路由分析 (src/app/api/)

共 **55 個 API 端點**

### 9.1 核心 API

| 端點 | 大小 | 方法 | 功能 |
|------|------|------|------|
| /api/chat | 24,772 bytes | POST | AI 聊天 |
| /api/webhooks/paypal | 20,563 bytes | POST | PayPal Webhook |
| /api/subscription | 13,488 bytes | GET/POST | 訂閱管理 |
| /api/health | 11,269 bytes | GET | 健康檢查 |

### 9.2 遊戲房間 API

| 端點 | 功能 |
|------|------|
| /api/games/rooms | 創建/列出房間 |
| /api/games/rooms/[slug] | 房間詳情 |
| /api/games/rooms/[slug]/join | 加入房間 |
| /api/games/rooms/[slug]/leave | 離開房間 |
| /api/games/rooms/[slug]/game-state | 遊戲狀態 |
| /api/games/rooms/[slug]/cheers | 乾杯動作 |
| /api/games/rooms/[slug]/script-murder | 劇本殺 |

### 9.3 學習 API

| 端點 | 功能 |
|------|------|
| /api/learn/progress | 學習進度 |
| /api/learn/discussions | 課程討論 |
| /api/learn/notes | 筆記 |
| /api/learn/certificate | 證書 |
| /api/learn/wines | 葡萄酒資料 |
| /api/learn/tasting-notes | 品酒筆記 |

### 9.4 管理 API

| 端點 | 功能 |
|------|------|
| /api/admin/users | 用戶管理 |
| /api/admin/usage | 使用統計 |
| /api/admin/knowledge | 知識庫管理 |
| /api/admin/knowledge/[id] | 知識條目 CRUD |

### 9.5 認證 API

| 端點 | 功能 |
|------|------|
| /api/auth/verify-turnstile | Turnstile 驗證 |
| /api/auth/sessions | 會話管理 |
| /api/auth/login-limit | 登入限制 |
| /api/auth/login-failure | 登入失敗記錄 |
| /api/auth/notify-security | 安全通知 |

### 9.6 其他 API

| 端點 | 功能 |
|------|------|
| /api/party-dj/plan | 派對 DJ 規劃 |
| /api/recommend | AI 推薦 |
| /api/trivia/questions | 問答題目 |
| /api/scripts | 劇本管理 |
| /api/upload | 檔案上傳 |
| /api/analytics | 分析事件 |
| /api/breweries | 酒廠資料 |

---

## 10. 類型定義分析 (src/types/)

共 **8 個類型檔案**

| 檔案 | 大小 | 內容 |
|------|------|------|
| script-murder.ts | 6,518 bytes | 劇本殺類型 |
| api-bodies.ts | 3,342 bytes | API 請求/響應類型 |
| games.ts | 1,197 bytes | 遊戲類型 |
| assistant.ts | 946 bytes | 助理類型 |
| chat-messages.ts | 373 bytes | 聊天訊息類型 |
| canvas-confetti.d.ts | 758 bytes | Confetti 庫聲明 |
| uuid.d.ts | 330 bytes | UUID 庫聲明 |
| api-generated.d.ts | 304 bytes | 自動生成類型 |

---

## 11. 配置分析 (src/config/)

共 **24 個配置檔案**

| 檔案 | 大小 | 功能 |
|------|------|------|
| games.config.ts | 38,287 bytes | 遊戲配置 (最大) |
| learn-curriculum.ts | 14,781 bytes | 課程大綱 |
| design-tokens.ts | 7,451 bytes | 設計令牌 |
| pricing.config.ts | 5,992 bytes | 定價配置 |
| analytics.config.ts | 4,331 bytes | 分析配置 |
| toast.config.ts | 3,574 bytes | Toast 配置 |
| premium-games.config.ts | 3,543 bytes | 付費遊戲配置 |
| errors.config.ts | 2,960 bytes | 錯誤配置 |
| profile.config.ts | 2,550 bytes | 個人檔案配置 |

---

## 12. 測試覆蓋分析

### 12.1 專案內測試檔案 (~50 個)

**單元測試** (src/lib/*.test.ts):
- truth-or-dare.test.ts
- never-have-i-ever.test.ts
- who-most-likely.test.ts
- formatters.test.ts
- subscription.test.ts
- gamification.test.ts
- groq.test.ts
- 等 26 個

**組件測試** (src/components/\__tests__/):
- GameCard.test.tsx
- games.smoke.test.tsx
- error-boundary.test.tsx

**Store 測試** (src/store/*.test.ts):
- useGameStore.test.ts
- usePartyStore.test.ts
- useUserStore.test.ts
- useSubscriptionStore.test.ts

**API 測試** (src/\__tests__/api/):
- chat-route.test.ts
- health-route.test.ts
- subscription-route.test.ts
- games-rooms-route.test.ts
- join-route.test.ts
- leave-route.test.ts
- 等 10 個

**E2E 測試** (e2e/):
- critical-paths.spec.ts (Playwright)

### 12.2 測試框架

- **單元測試**: Vitest + @testing-library/react
- **E2E 測試**: Playwright
- **無障礙測試**: @axe-core/playwright

---

## 13. 公共資源分析 (public/)

| 類型 | 數量 | 說明 |
|------|------|------|
| PNG 圖片 | 55 個 | Logo、圖標、背景 |
| JSON | 9 個 | manifest.json、lottie 動畫 |
| SVG | 5 個 | 向量圖標 |
| HTML | 1 個 | 離線頁面 |
| ICO | 1 個 | favicon |
| JS | 1 個 | sw.js (Service Worker) |

---

## 14. 技術棧總結

### 14.1 前端

| 技術 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.5.7 | React 框架 (App Router) |
| React | 19.0.0 | UI 庫 |
| TypeScript | 5.7.0 | 類型系統 |
| Tailwind CSS | 3.4.17 | 樣式 |
| Framer Motion | 12.31.1 | 動畫 |
| Zustand | 5.0.0 | 狀態管理 |
| TanStack Query | 5.90.20 | 數據請求 |
| Lucide React | 0.469.0 | 圖標 |

### 14.2 後端/服務

| 技術 | 用途 |
|------|------|
| Supabase | 資料庫、認證、即時通訊 |
| Groq | AI Chat 主線 |
| OpenRouter | Embedding + Chat fallback |
| NVIDIA NIM | Chat fallback (選填) |
| Pinecone | 向量資料庫 (RAG) |
| PayPal | 訂閱支付 |
| Cloudflare Turnstile | 人機驗證 |
| Upstash Redis | 分散式限流 |
| Sentry | 錯誤監控 |
| Resend | Email 發送 |

### 14.3 開發/測試

| 技術 | 用途 |
|------|------|
| Vitest | 單元測試 |
| Playwright | E2E 測試 |
| ESLint | 代碼檢查 |
| Husky | Git hooks |
| Bundle Analyzer | 打包分析 |

---

## 15. 問題與建議

### 15.1 優點

1. **完善的類型系統**: 全面使用 TypeScript，類型覆蓋良好
2. **測試覆蓋**: 有單元測試、組件測試、API 測試、E2E 測試
3. **安全考量**: CSP、HSTS、Turnstile 驗證、速率限制
4. **性能優化**: Turbopack、Bundle 分割、圖片優化、緩存策略
5. **PWA 支持**: Service Worker、離線支持
6. **國際化**: i18n 支持多語言
7. **模塊化**: 組件、Hooks、工具函數分離清晰
8. **文檔**: .env.example 詳盡，便於新開發者上手

### 15.2 潛在問題

1. **大型組件**: 部分組件過大 (LearnCourseContent: 106KB)，建議拆分
2. **代碼重複**: 多個相似的遊戲組件可能有重複邏輯，考慮抽象
3. **測試覆蓋不均**: UI 組件測試較少，建議增加
4. **Bundle 大小**: 遊戲組件較多，建議更多動態導入

### 15.3 改進建議

1. **組件拆分**: 將 LearnCourseContent.tsx 拆分為更小的子組件
2. **遊戲邏輯抽象**: 創建通用遊戲 Hook 減少重複代碼
3. **增加測試**: 為核心 UI 組件添加更多測試
4. **性能監控**: 添加 Web Vitals 監控 (已有 WebVitalsReporter)
5. **文檔完善**: 為複雜組件添加 JSDoc 註釋

---

## 16. 總結

Cheersin 是一個功能豐富的 **酒類學習與派對遊戲平台**，基於 Next.js 15 App Router 構建。專案結構清晰，代碼質量良好，具備完善的:

- **遊戲系統**: 150+ 個遊戲組件，支持即時多人遊戲
- **學習系統**: 課程、證書、知識庫、AI 助理
- **訂閱系統**: PayPal 集成、多級訂閱
- **安全機制**: CSP、限流、人機驗證
- **測試體系**: 單元測試 + E2E 測試

總代碼量約 **98,560 行**，是一個成熟的生產級應用。
