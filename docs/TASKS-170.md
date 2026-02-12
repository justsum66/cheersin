# Cheersin 170 最高優先級任務清單

依據計畫「企業級審查與 170 任務實作」產出。每項含：id、category、title、priority、file/area、acceptance。完成請勾選 `[x]`。

---

## Security (15)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| SEC-001 | API rate limiting 覆蓋所有公開 API 路由 | P0 | src/app/api | 未認證/高頻路由皆有限流，回傳 429 |
| SEC-002 | RLS 審計：profiles / game_rooms / game_states 政策完整 | P0 | supabase/migrations | 無 SELECT/INSERT/UPDATE 遺漏，通過顧問檢查 |
| SEC-003 | 所有 API 輸入使用 Zod 校驗，無 raw body 信任 | P0 | src/app/api | 每 route 有 schema.parse 或等價 |
| SEC-004 | 敏感資料不存 localStorage（聊天記錄等）審計與遷移 | P0 | src/lib, src/components | 僅存 non-sensitive 或改 sessionStorage/加密 |
| SEC-005 | 關鍵 API 加上 CSRF / origin 檢查 | P1 | src/app/api, middleware | 支付/訂閱/join 等有驗證 |
| SEC-006 | XSS：用戶輸入輸出皆經 sanitize 或 React 轉義 | P1 | src/components, src/lib/sanitize.ts | 無 dangerouslySetInnerHTML 未淨化 |
| SEC-007 | CSP 頭部覆蓋並收緊 | P1 | next.config.ts, middleware | 無 inline script 必要則 nonce |
| SEC-008 | Turnstile 驗證失敗時不建立 session | P1 | src/app/api/auth | 登入流程文件化且實作一致 |
| SEC-009 | JWT 刷新與過期處理統一 | P1 | src/lib/supabase*, auth | 無 401 未處理 |
| SEC-010 | 環境變數與 API Key 僅 server 使用審計 | P1 | src/app/api, lib | 無 NEXT_PUBLIC_ 暴露 secret |
| SEC-011 | SQL 參數化審計（無字串拼接查詢） | P2 | supabase, lib | 全部使用參數化 |
| SEC-012 | 檔案上傳類型與大小限制強制 | P2 | src/app/api/upload | 白名單 MIME + max size |
| SEC-013 | 密碼/房間密碼強度與儲存方式 | P2 | api/games/rooms, join | 不明文儲存 |
| SEC-014 | 依賴漏洞掃描並修復 high/critical | P3 | package.json | npm audit 通過或已知接受 |
| SEC-015 | 安全相關 logging 不記錄敏感欄位 | P3 | src/lib/logger, api-error-log | 無 password/token 入 log |

---

## Performance (20)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| PERF-001 | 首頁與遊戲列表 bundle 拆分，關鍵路徑 < 200KB | P0 | src/app/(marketing), (app)/games | next build 分析達標 |
| PERF-002 | LCP/INP/CLS 達標：LCP < 2.5s, CLS < 0.1 | P0 | 全站 | Lighthouse 或 Web Vitals 達標 |
| PERF-003 | 遊戲元件懶加載審計，100+ 遊戲皆 lazy | P1 | src/components/games, GameLazyMap | 無首屏載入全部遊戲 |
| PERF-004 | 圖片使用 next/image 與合適 size/priority | P1 | src/components, app | 首屏圖 priority，其餘 lazy |
| PERF-005 | React Query 快取 TTL 與 stale 策略一致 | P1 | src/lib/query-client, 各頁 | 無過度 refetch |
| PERF-006 | 長列表（學習課程、遊戲列表）虛擬滾動或分頁 | P1 | learn, games | 100+ 項不一次 DOM 全渲染 |
| PERF-007 | 動畫使用 will-change 或 transform 僅 compositor | P1 | globals.css, framer-motion | 無 layout thrashing |
| PERF-008 | API 回應壓縮與快取頭（Cache-Control） | P1 | api routes, next.config | 靜態/列表可快取 |
| PERF-009 | 移除未使用 CSS 與 dead code | P1 | tailwind, components | build 無明顯浪費 |
| PERF-010 | 關鍵 API 延遲 < 500ms（或優化查詢） | P1 | api/games, learn, chat | 關鍵路徑實測 |
| PERF-011 | memo/useMemo/useCallback 審計高重繪元件 | P1 | components/games, learn | 列表項與昂貴子元件 |
| PERF-012 | 字體載入策略（font-display, subset） | P1 | layout, globals.css | 無 FOIT 阻塞 |
| PERF-013 | 第三方腳本延遲或 async | P2 | Sentry, Turnstile, 分析 | 不阻塞主線程 |
| PERF-014 | 服務端組件優先，client 僅必要處 | P2 | app/**/page.tsx | 無不必要 "use client" |
| PERF-015 | 預載關鍵路由 link prefetch | P2 | Link 元件 | 可見連結 prefetch |
| PERF-016 | 減少水合 payload（僅必要 state） | P2 | layout, stores | 無重複資料 |
| PERF-017 | Web Vitals 持續監控與門檻告警 | P2 | WebVitalsReporter, Sentry | 閾值可配置 |
| PERF-018 | 圖片格式 WebP/AVIF  where 支援 | P2 | next.config, Image | 現代瀏覽器優先 |
| PERF-019 | 關鍵靜態資源 CDN/快取策略文件 | P3 | vercel.json, docs | 文件化 |
| PERF-020 | Bundle 分析納入 CI 或定期報告 | P3 | scripts, CI | 可選 |

---

## Accessibility (18)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| A11Y-001 | 全站焦點順序與 tab 邏輯合理 | P0 | 各頁 layout, modal | 無焦點陷阱、順序符合視覺 |
| A11Y-002 | 互動元件具備 aria-label 或可見文字 | P0 | buttons, links, icons | 無僅圖示無說明 |
| A11Y-003 | 色彩對比 WCAG AA（4.5:1 文字） | P0 | design-tokens, 主要頁 | 對比工具通過 |
| A11Y-004 | 表單錯誤與必填明確標示（aria-invalid, live region） | P1 | 表單元件, login, party-room | 螢幕閱讀器可讀錯誤 |
| A11Y-005 | 跳過主內容連結（skip link） | P1 | layout.tsx | 鍵盤可達且可見 |
| A11Y-006 | 模態框焦點鎖定與 Esc 關閉 | P1 | modal, dialog 元件 | focus trap + Esc |
| A11Y-007 | 鍵盤可操作所有主要流程（遊戲、學習、訂閱） | P1 | 關鍵頁 | 無僅滑鼠可點 |
| A11Y-008 | 標題階層 h1→h2→h3 不跳級 | P1 | 各 page | 每頁單一 h1 |
| A11Y-009 | 動畫尊重 prefers-reduced-motion | P1 | framer-motion, globals | 關閉或簡化動畫 |
| A11Y-010 | 圖片 alt 有意義，裝飾圖 aria-hidden | P1 | 全站 Image, img | 無空 alt 內容圖 |
| A11Y-011 | 直播/即時區域 aria-live 適當 | P1 | party-room, script-murder | 狀態變更可播報 |
| A11Y-012 | 觸控目標至少 44x44px | P1 | 按鈕, 導航 | 符合 WCAG |
| A11Y-013 | E2E a11y 測試（axe）通過關鍵頁 | P2 | e2e/a11y.spec.ts | 無 critical/serious |
| A11Y-014 | 語言切換與 RTL 考量（若未來支援） | P2 | i18n, layout | 文件或預留 |
| A11Y-015 | 錯誤邊界與載入狀態可讀 | P2 | ErrorBoundary, loading | 語意化 |
| A11Y-016 | 清單與地標 role 正確 | P2 | nav, main, list | 語意化 |
| A11Y-017 | 自訂控制項可鍵盤操作 | P3 | 遊戲控制, 滑桿 | 鍵盤可達 |
| A11Y-018 | 無障礙聲明頁面更新 | P3 | accessibility/page.tsx | 與實作一致 |

---

## i18n (12)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| I18N-001 | 關鍵流程無硬編碼中文（登入、訂閱、派對房） | P0 | 對應頁與元件 | 皆用 t() 或 messages |
| I18N-002 | en/zh-TW/zh-CN 三語 key 覆蓋率 100% | P1 | messages/*.json | check:i18n 通過 |
| I18N-003 | ja/ko/yue 缺 key 時 fallback 邏輯 | P1 | lib/i18n, config | 不顯示 key 名 |
| I18N-004 | 日期與數字依 locale 格式化 | P1 | lib/formatters, 顯示處 | date-fns locale 或 Intl |
| I18N-005 | 錯誤訊息與 API 錯誤多語 | P1 | messages, api 回傳 | 用戶可見皆可譯 |
| I18N-006 | 課程與遊戲名稱/描述可譯或後台管理 | P1 | data, learn, games | 策略一致 |
| I18N-007 | 動態文案（如「第 N 題」）使用 ICU 或參數化 | P2 | messages, 元件 | 無字串拼接 |
| I18N-008 | SEO 與 og 標籤依 locale | P2 | layout, opengraph | hreflang, title/desc |
| I18N-009 | 驗證訊息（Zod 等）多語 | P2 | validators, 表單 | 錯誤可譯 |
| I18N-010 | 語言切換器無閃爍與路徑一致 | P2 | 語言切換元件 | 換語後路徑正確 |
| I18N-011 | 多語 E2E 抽樣（至少 en + zh-TW） | P3 | e2e | 關鍵路徑各跑一語 |
| I18N-012 | i18n 貢獻與 key 命名文件 | P3 | docs/i18n-guide.md | 更新 |

---

## UX/UI (25)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| UX-001 | 主要頁面載入時有 skeleton 或 loading 狀態 | P0 | learn, games, party-room, quiz | 無白屏 |
| UX-002 | 表單與 API 錯誤有明確用戶可見回饋 | P0 | 表單, error boundary | 不只有 console |
| UX-003 | 觸控目標至少 48px（按鈕、導航、遊戲控制） | P1 | 全站 CTA | 符合規範 |
| UX-004 | 手機底部導航不被鍵盤完全遮擋 | P1 | layout, 輸入頁 | 鍵盤彈起時可操作 |
| UX-005 | 設計 token 一致（間距、圓角、陰影） | P1 | design-tokens, 元件 | 無 magic number |
| UX-006 | 圖示系統統一（lucide 或單一來源） | P1 | components | 無混用多套 |
| UX-007 | 載入與錯誤狀態與設計系統一致 | P1 | loading.tsx, error.tsx | 樣式統一 |
| UX-008 | 深色/淺色主題無對比遺漏 | P1 | 全站 | 兩主題皆可讀 |
| UX-009 | 響應式斷點與 RWD 文件一致 | P1 | tailwind, rwd-breakpoints | 三斷點無錯位 |
| UX-010 | 遊戲與學習 CTA 明顯且文案一致 | P1 | 首頁, learn, games | 轉換路徑清晰 |
| UX-011 | 空狀態（無資料）有說明與行動引導 | P1 | 列表頁, profile | 無空白區塊 |
| UX-012 | 成功操作有 toast 或即時回饋 | P1 | 訂閱成功, 加入房間, 儲存 | 一致 |
| UX-013 | 導航當前頁高亮/aria-current | P1 | Nav, 側邊欄 | 用戶知所在 |
| UX-014 | 長內容可讀性（行寬、行高） | P2 | 文章, 課程內文 | 不超 75ch 等 |
| UX-015 | 微互動（hover/focus）一致 | P2 | 按鈕, 連結 | 有反饋 |
| UX-016 | 彈窗與抽屜動畫流暢 | P2 | modal, drawer | 無卡頓 |
| UX-017 | 表單驗證即時（onBlur 或 debounce） | P2 | 登入, 註冊, 房間 | 不只在 submit |
| UX-018 | 無障礙焦點可見（outline） | P2 | 全域, focus-visible | 鍵盤可辨 |
| UX-019 | 首屏與內頁 meta 描述差異化 | P2 | layout, 各頁 | SEO 與預覽正確 |
| UX-020 | 離線或網路錯誤有提示 | P2 | PWA, 請求失敗 | 用戶可理解 |
| UX-021 | 遊戲結束與派對房結束狀態明確 | P2 | games, party-room | 有結算或引導 |
| UX-022 | 訂閱方案對比清晰 | P2 | pricing | 差異易比較 |
| UX-023 | 進階動畫可關閉或降級 | P3 | 華麗動畫 | reduced-motion 已做則可選 |
| UX-024 | 列印樣式（證書、學習單） | P3 | certificate, 列印 CSS | 可選 |
| UX-025 | 鍵盤快捷鍵說明（若有） | P3 | 說明頁或 tooltip | 可選 |

---

## Copy & Content (15)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| COPY-001 | 首頁 hero CTA 文案 A/B 可測且轉換導向 | P1 | (marketing)/page | 明確價值主張 |
| COPY-002 | 登入/註冊頁說明與信任文案 | P1 | login, auth | 降低摩擦 |
| COPY-003 | 錯誤頁（404/500）友善文案與導航 | P1 | not-found, error | 可引導回站 |
| COPY-004 | 訂閱頁價值說明與 FAQ | P1 | pricing, subscription | 減少猶豫 |
| COPY-005 | 學習模組課程內容深度：每課有目標與測驗對齊 | P1 | data, learn | 內容與學習目標一致 |
| COPY-006 | 遊戲說明簡短且可於遊戲內查看 | P1 | games 說明 | 不冗長、可達 |
| COPY-007 | 派對房與劇本殺 onboarding 步驟清晰 | P1 | party-room, script-murder | 首次使用可完成 |
| COPY-008 | 助理/AI 回覆邊界與 fallback 文案 | P1 | assistant, chat | 無未處理錯誤露出的技術語 |
| COPY-009 | 課程章節標題與描述一致多語 | P2 | data, messages | 無缺譯 |
| COPY-010 | 測驗題幹與選項無錯字與語意不清 | P2 | quiz, learn exam | 審閱通過 |
| COPY-011 | 郵件與推播文案多語與品牌一致 | P2 | 通知, 郵件模板 | 可選 |
| COPY-012 | 法律頁（隱私、條款）與產品一致 | P2 | privacy, terms | 定期審閱 |
| COPY-013 | 成就與徽章名稱與描述 | P2 | learn/badges | 可譯且一致 |
| COPY-014 | 深度內容：葡萄酒/威士忌/調酒知識擴充 | P3 | 課程內容 | 可選 |
| COPY-015 | KOL/合作頁文案與 CTA | P3 | learn/kol, sponsor | 可選 |

---

## Game & Party (22)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| GAME-001 | 派對房建立→加入→遊戲→離開 無狀態錯亂 | P0 | party-room, usePartyRoomState | E2E 與手動通過 |
| GAME-002 | 劇本殺房間狀態與 Realtime 同步一致 | P0 | script-murder, useScriptMurderRealtime | 多人同步無錯 |
| GAME-003 | 遊戲狀態寫入前 Zod 校驗，無髒資料 | P0 | api/games/rooms/*/game-state, party-state-schema | 非法 payload 400 |
| GAME-004 | 房主離開時房間處置（移交或結束）明確 | P1 | api/leave, PartyRoomEnded | 文件與實作一致 |
| GAME-005 | 邀請連結複製與分享文案正確 | P1 | useCopyInvite, PartyRoomActive | 可複製且可讀 |
| GAME-006 | 乾杯/遊戲切換即時反映給所有成員 | P1 | game-state POST, realtime | 無延遲 > 2s |
| GAME-007 | 真心話大冒險/輪盤/骰子 在房內可選可玩 | P1 | PartyRoomActive, 遊戲元件 | 流程完整 |
| GAME-008 | 遊戲結束與返回大廳狀態清晰 | P1 | 各遊戲 end 狀態 | 有按鈕或引導 |
| GAME-009 | 劇本殺角色分配與劇本載入無錯 | P1 | script-murder API, Play | 角色與劇本對應 |
| GAME-010 | 遊戲內音效與觸覺可開關 | P1 | useGameSound, useHaptic | 設定可存 |
| GAME-011 | 派對房過期與清理（cleanup job） | P1 | supabase functions, rooms | 過期房不殘留 |
| GAME-012 | 觀眾模式（若有）不破壞玩家狀態 | P1 | game_room_players, UI | 可選 |
| GAME-013 | 遊戲錯誤邊界與重試引導 | P1 | GameErrorBoundary, 各遊戲 | 不白屏 |
| GAME-014 | 關鍵遊戲有完成/成功動畫或回饋 | P1 | 慶祝, confetti, Lottie | 提升遊戲體驗 |
| GAME-015 | 房間人數上限與滿房提示 | P1 | join API, Lobby | 4/8/12 依方案 |
| GAME-016 | 密碼房錯誤密碼提示友善 | P1 | join, Lobby | 不洩漏資訊 |
| GAME-017 | 遊戲列表載入與篩選不卡頓 | P2 | games page, GameLazyMap | 虛擬或分頁 |
| GAME-018 | 收藏/最近玩過 持久化與同步 | P2 | games-favorites, last-session | 跨裝置可選 |
| GAME-019 | 劇本殺劇本列表與預覽 | P2 | script-murder, API | 可選 |
| GAME-020 | 派對房 E2E 涵蓋建立→加入→選遊戲 | P2 | e2e/persona-flows/party-room | 通過 |
| GAME-021 | 遊戲內分享（社交）不破壞狀態 | P3 | ShareStoryCardButton 等 | 可選 |
| GAME-022 | 遊戲數據統計與回顧 | P3 | profile/history, 遊戲 | 可選 |

---

## Testing (25)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| TEST-001 | 關鍵 API 路由有單元測試（rooms, game-state, join, leave） | P0 | src/__tests__/api | 覆蓋 happy path + 錯誤 |
| TEST-002 | E2E critical-paths 全通過（nav, quiz, 登入, 訂閱） | P0 | e2e/critical-paths.spec.ts | CI 綠 |
| TEST-003 | test:run 無失敗 | P0 | vitest | 全部 pass |
| TEST-004 | test:stress 兩輪通過 | P0 | npm run test:stress | 無 flake |
| TEST-005 | TypeScript strict 無 any 新增；既有 any 有計劃消除 | P0 | tsconfig, 全專案 | tsc --noEmit 過，any 僅註記處 |
| TEST-006 | 建置成功 npm run build | P0 | 專案根 | 無錯誤 |
| TEST-007 | 學習與課程 validate 腳本通過 | P1 | validate:lessons, validate:content | 無錯誤 |
| TEST-008 | i18n check 腳本通過 | P1 | check:i18n | 無漏 key |
| TEST-009 | E2E persona-flows 至少 6 條通過 | P1 | e2e/persona-flows | assistant, games, learn, party-room, script-murder, subscription |
| TEST-010 | 遊戲邏輯單元測試（truth-or-dare, never-have-i-ever 等） | P1 | lib/*.test.ts | 核心邏輯覆蓋 |
| TEST-011 | 訂閱與支付流程 E2E 或高覆蓋 | P1 | subscription, webhooks | 可 mock |
| TEST-012 | 錯誤邊界與 fallback 有測試 | P1 | ErrorBoundary 等 | 可選 |
| TEST-013 | API 錯誤回傳格式一致且可測 | P1 | api-response, 各 route | 結構穩定 |
| TEST-014 | 覆蓋率目標：關鍵路徑 statements > 70% | P2 | vitest config | 可選 |
| TEST-015 | E2E a11y axe 通過關鍵頁 | P2 | e2e/a11y.spec.ts | 已列 A11Y-013 |
| TEST-016 | 負載或簡單壓力測試（可選） | P2 | scripts | 可選 |
| TEST-017 | 快照測試僅必要處（避免過度） | P2 | 元件測試 | 可選 |
| TEST-018 | CI 完整流程文件與可重現 | P2 | .github/workflows | 與本地一致 |
| TEST-019 | 新增功能 checklist 含「補測試」 | P2 | CONTRIBUTING 或 docs | 可選 |
| TEST-020 | Mock 策略文件（Supabase, OpenRouter 等） | P2 | __tests__/setup | 可選 |
| TEST-021 | 遊戲房間 API 整合測試腳本 | P3 | scripts/test-games-room.mjs | 可選 |
| TEST-022 | 瀏覽器 Console 無未處理錯誤（E2E 或手動） | P3 | 全站 | 與 DevOps 重疊 |
| TEST-023 | 迴歸測試清單與排程 | P3 | docs | 可選 |
| TEST-024 | 效能迴歸閾值（Lighthouse CI） | P3 | lighthouse.yml | 可選 |
| TEST-025 | 依賴更新與測試通過策略 | P3 | dependabot, CI | 可選 |

---

## DevOps & Quality (20)

| ID | Title | Priority | File/Area | Acceptance |
|----|-------|----------|-----------|------------|
| DEV-001 | npm run lint 零錯誤零警告（或僅已接受規則） | P0 | .eslintrc, 全專案 | 通過 |
| DEV-002 | npx tsc --noEmit 通過 | P0 | tsconfig.json | 無型別錯誤 |
| DEV-003 | 生產 build 無錯誤 | P0 | next build | 通過 |
| DEV-004 | Console 清理：生產程式碼無 console.log/error/warn（改 logger 或移除） | P0 | src | 僅 logger 或移除，約 30+ 處 |
| DEV-005 | 每階段結束可執行 commit 與 push | P0 | git | 訊息符合約定 |
| DEV-006 | pre-commit 或 CI 跑 lint（若有 husky） | P1 | .husky, lint-staged | 已存在則確認 |
| DEV-007 | CI 跑 test:run + build（或等同） | P1 | .github/workflows/ci.yml | 通過 |
| DEV-008 | 環境變數驗證腳本在 start 前執行 | P1 | prestart, validate-env | 缺變數時明確失敗 |
| DEV-009 | 無未使用依賴與明顯 dead code | P1 | package.json, 全專案 | depcheck 可接受 |
| DEV-010 | 錯誤日誌與監控（Sentry）不洩漏敏感資訊 | P1 | Sentry config, api-error-log | 已過濾 |
| DEV-011 | 建置與部署文件（README 或 DEPLOYMENT） | P1 | docs, README | 可讓新人跑起 |
| DEV-012 | CHANGELOG 或版本註記可維護 | P1 | CHANGELOG.md | 有則更新 |
| DEV-013 | 重大 API 變更有遷移或版本說明 | P2 | api-docs, docs | 可選 |
| DEV-014 | 分支策略與 PR 檢查一致 | P2 | GitHub | 可選 |
| DEV-015 | 預覽環境與生產環境變數分離 | P2 | .env.example, 文件 | 可選 |
| DEV-016 | 日誌等級與輪轉策略（若適用） | P3 | logger | 可選 |
| DEV-017 | 監控告警閾值文件 | P3 | docs | 可選 |
| DEV-018 | 災難復原與備份要點 | P3 | docs | 可選 |
| DEV-019 | 依賴固定與審計排程 | P3 | package-lock, npm audit | 可選 |
| DEV-020 | 效能預算或 bundle 預算 | P3 | CI, next.config | 可選 |

---

## Phase 對照

- **Phase 1（約 50 項）**：所有 P0（上表 P0 欄） + 高影響 P1（SEC-005~010, PERF-003~006, A11Y-004~008, UX-003~008, GAME-004~010, TEST-007~010, DEV-006~012 中選約 24 項）。
- **Phase 2**：其餘 P1 + 多數 P2。
- **Phase 3**：其餘 P2 + P3。

完成 Phase 1 後執行：`lint` → `tsc --noEmit` → `test:run` → `test:stress` → `build` → `test:e2e:critical` → 修正 Console 錯誤 → commit & push。

---

## Phase 2 續完成紀錄

| 日期 | 任務 ID | 摘要 |
|------|---------|------|
| 2026-02-12 | I18N-004 | formatters 支援 locale 參數（formatDate/Time/DateTime/Relative/Number/Currency/Percent） |
| 2026-02-12 | GAME-015, GAME-016 | 派對房 join API 回傳 code ROOM_FULL/INVALID_PASSWORD；messages 新增 roomFull、wrongPassword；前端依 code 顯示 i18n |
| 2026-02-12 | SEC-006 | sanitize.ts 註明 ld+json 政策；新增 SafeJsonLdScript 並替換各處 ld+json |
| 2026-02-12 | A11Y-006 | 定價首訪、KingsCup、GameWrapperBody、GameWrapperHeader、PunishmentWheelModal、PaidGameLock 等補齊 Esc 關閉 |
| 2026-02-12 | **Phase 2 續：40 任務** | **Batch 1 (SEC)**：SEC-007 CSP 註解、SEC-008 Turnstile 流程註解、SEC-010 .env.example 審計註明、SEC-012 upload 白名單註解、SEC-014 audit script、SEC-015 SENSITIVE_KEYS 擴充 |
| 2026-02-12 | (續) | **Batch 2 (PERF)**：PERF-003 GameLazyMap 註解、PERF-004/018 next.config images 註解、PERF-008 games/rooms Cache-Control、PERF-013 Turnstile dynamic 註解 |
| 2026-02-12 | (續) | **Batch 3 (A11Y)**：A11Y-005 skip link aria-label、A11Y-011 ScriptMurder aria-live、accessibility-audit-checklist.md |
| 2026-02-12 | (續) | **Batch 4 (I18N+UX)**：I18N-003/007 t() fallback + interpolate、I18N-005 apiErrors + getDisplayErrorMessage、I18N-008 layout meta 註解、UX-007/020 OfflineBanner i18n、meta/apiErrors/gameError/offlineMessage 多語 |
| 2026-02-12 | (續) | **Batch 5 (COPY/GAME/TEST)**：COPY-003/006 not-found/error 友善+規則 modal 註解、GAME-013 GameErrorBoundary i18n 文案、TEST-008 check:i18n 關鍵命名空間、TEST-013 getErrorCode + api-response 註解 |
| 2026-02-12 | (續) | **Batch 6 (DEV)**：DEV-004 mask-context 抽離、api-error-log/middleware 改 logger、DEV-008 prestart 已有、DEV-009 depcheck 已有 |
| 2026-02-12 | **Phase 2 續：55 任務** | **Batch 1 (SEC)**：SEC-001 訂閱/上傳 API 限流 + docs/security-api-rate-limit.md；SEC-004 docs/security-localstorage-audit.md；SEC-005 middleware 註解；SEC-009 supabase.ts 註解 |
| 2026-02-12 | (續) | **Batch 2 (PERF)**：PERF-005 query-client 註解；PERF-006 learn 每等級顯示更多 + games Lobby 分頁；PERF-007/012 globals、layout 註解；PERF-009/010 docs/performance-audit.md |
| 2026-02-12 | (續) | **Batch 3 (A11Y+I18N)**：A11Y-001/002/009/013 accessibility-audit-checklist；I18N-001 登入全 t()、ERROR_CODE_KEYS；I18N-006/009/010 docs/i18n-guide |
| 2026-02-12 | (續) | **Batch 4 (UX+COPY)**：UX-001 pricing/login loading.tsx；UX-005 globals 註解；docs/ux-copy-checklist.md |
| 2026-02-12 | (續) | **Batch 5 (GAME+TEST)**：GAME-003 已有 Zod；docs/game-test-checklist.md；test:run 168 通過 |
| 2026-02-12 | (續) | **Batch 6 (DEV)**：docs/dev-checklist.md；lint/tsc/build 通過；husky+CI 已有 |
| 2026-02-12 | **Phase 2 續：70 任務** | **Batch 1 (SEC+PERF)**：SEC-006/011/013 docs/security-xss-sql-audit；PERF-011～017/019/020 docs/performance-audit |
| 2026-02-12 | (續) | **Batch 2 (A11Y+I18N)**：A11Y-014 RTL 預留、015 ErrorFallback role=alert、016～018 檢查清單與聲明頁；I18N-011 多語 E2E 抽樣、012 i18n-guide |
| 2026-02-12 | (續) | **Batch 3 (UX)**：UX-008～022 docs/ux-batch3-audit、rwd-breakpoints 三斷點 |
| 2026-02-12 | (續) | **Batch 4 (COPY)**：COPY-004～015 docs/copy-batch4-audit |
| 2026-02-12 | (續) | **Batch 5 (GAME)**：GAME-010 觸覺可開關 games-settings/useHaptic/SettingsModal；docs/game-batch5-audit |
| 2026-02-12 | (續) | **Batch 6 (TEST)**：TEST-015 a11y 含 /learn；docs/test-batch6-audit、CONTRIBUTING 檢查清單 |
| 2026-02-12 | (續) | **Batch 7 (DEV)**：DEV-013～018 docs/dev-batch7-audit、dev-checklist 擴充 |
| 2026-02-12 | **Phase 2 續：下一批** | **Batch 1 (UX)**：UX-002/003/004/006/023～025 docs/ux-batch3-audit、Navigation 鍵盤捲動 |
| 2026-02-12 | (續) | **Batch 2 (COPY)**：COPY-001/002/007/008 登入 trustPrivacy、派對房/劇本殺 onboardingSteps、assistant errorFallback/emptyReply、ux-copy-checklist |
| 2026-02-12 | (續) | **Batch 3 (GAME)**：GAME-004 房主離開即結束房間（leave API + party-room-flow-api）、GAME-005 邀請 i18n、GAME-006 輪詢 2s、GAME-007/008/009 docs/game-batch5-audit |
| 2026-02-12 | (續) | **Batch 4 (TEST)**：TEST-001 leave-route 單元測試、validate:lessons/content、check:i18n、test:stress 兩輪、game-test-checklist 更新 |
| 2026-02-12 | (續) | **Batch 5 (DEV)**：DEV-019/020 docs/dev-batch7-audit（依賴審計、bundle 預算） |
| 2026-02-12 | **Phase 2 續：下一批 35** | **Batch 1 (審計後 6)**：SEC-002 docs/rls-audit-next.md、SEC-003 docs/api-zod-audit.md、PERF-001/002 performance-audit、A11Y-003 accessibility-audit-checklist、I18N-002 zh-CN 補 key + merge-i18n-keys.mjs + check:i18n:three |
| 2026-02-12 | (續) | **Batch 2 (A11Y+UX)**：A11Y-004 party-room 表單 aria-invalid/describedby/live、A11Y-007/008/010/012 檢查清單勾選、UX-013 Navigation 已有 aria-current |
| 2026-02-12 | (續) | **Batch 3 (GAME+COPY+I18N)**：GAME-011 party-room-flow-api 過期清理文件、GAME-013/014/017/020 game-batch5-audit、COPY-010 docs/copy-audit-checklist、I18N-009 docs/i18n-validation |
| 2026-02-12 | (續) | **Batch 4 (TEST+SEC+PERF)**：TEST-005 docs/ts-any-plan、TEST-018 CONTRIBUTING CI、SEC-011/012 docs/security-audit-notes、PERF-014/015/016 已有 performance-audit |
| 2026-02-12 | (續) | **Batch 5 (DEV+Pipeline)**：DEV-011 README 建置與部署、DEV-012 CHANGELOG 更新、lint/tsc/test:run 通過 |
| 2026-02-12 | **下一批續** | **PERF**：PERF-003/008/013 註解與檢查清單（performance-audit.md）；**A11Y**：A11Y-005 skip link、A11Y-006 modal Esc、A11Y-013 E2E axe（accessibility-audit-checklist）；**COPY**：COPY-003/004 錯誤頁與訂閱 FAQ（copy-audit-checklist）；**GAME**：GAME-007/008 已於 game-batch5-audit；**TEST/DEV**：TEST-015、DEV-013 已於 test-batch6、dev-batch7 |
| 2026-02-12 | **下一批續 2** | **A11Y**：A11Y-003 色彩對比工具/步驟、A11Y-009/015/016/017 檢查清單勾選或抽檢項（accessibility-audit-checklist）；**PERF**：PERF-014 驗收勾選、PERF-019/020 註明（performance-audit、README）；**UX**：UX-004 鍵盤遮擋現狀、UX-002 訂閱/join 失敗回饋勾選（ux-copy-checklist）；**COPY**：COPY-006/009（copy-audit-checklist）；**I18N**：I18N-006 課程/遊戲名稱可譯策略（i18n-guide）；**SEC/DEV**：SEC-010 .env 註解、DEV-014/015 dev-checklist 條目 |
| 2026-02-12 | **下一批續 3** | **A11Y**：A11Y-001/002 驗收步驟與抽檢清單、A11Y-017 具體元件名（Lobby、Roulette、PunishmentWheel 等）（accessibility-audit-checklist）；**PERF**：PERF-001 填表指引、PERF-002 Lighthouse 測量步驟（performance-audit）；**審計**：api-zod-audit 關鍵路由勾選、rls-audit-next 現狀已滿足註明；**COPY/UX**：COPY-006/009 抽檢方法、UX-004 建議實作位置與登入頁 scrollIntoView 實作（ux-copy-checklist）；TASKS-170、CHANGELOG 更新 |
| 2026-02-12 | **下一批續 4（30 任務批次）** | **A**：PERF-001/002 測量填表、A11Y-003 抽檢、PERF-014 驗收；**B**：檢查清單與審計（A11Y、COPY、api-zod、dev-batch7、ux-batch3、game-batch5、accessibility 頁）；**C**：API Zod 補齊 chat、games/rooms POST・PATCH、learn/progress；**D**：派對房 scrollIntoView、A11Y-017 鍵盤、aria-label、DEV-004 審計、SEC-013/PERF-015 註解；**E**：ts-any-plan、CONTRIBUTING E2E、TASKS-170、CHANGELOG |
| 2026-02-12 | **50 任務批次（三支柱）** | **用戶吸引力**：COPY-001/002、UX-010/022/019/011 確認；**課程深度**：COPY-005 learningObjectives（wine-101、whisky-101、white-wine）、LearnCourseContent 首屏展示、validate:lessons/content 通過、copy-audit COPY-005；**遊戲體驗**：GAME-014 TruthOrDare 完成/下一輪 confetti、copy-audit 抽檢項；TASKS-170、CHANGELOG 更新 |
| 2026-02-11 | **Phase B：SEC/PERF 審計補註** | rls-audit-next、api-zod-audit 已勾選；performance-audit PERF-014 驗收項補勾與 Phase B 補註 |
| 2026-02-11 | **Phase B：A11Y 抽檢 + E2E 穩化 + B4 文件** | A11Y-001/002/017 抽檢勾選（accessibility-audit-checklist）；E2E dismissAgeGate、FAQ/I18N 修正、playwright timeout、docs/e2e-critical-paths.md；COPY-011/012/013、GAME-018 文件註明（copy-batch4、game-batch5） |
