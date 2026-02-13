# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **P1 下一批 18 任務（2026-02-13）**：UX-004 鍵盤遮擋 docs/ux-keyboard-nav.md；UX-005 設計 token 註解 globals.css；UX-009 docs/rwd-breakpoints.md；A11Y-001 焦點順序審計 a11y-audit-checklist；A11Y-002 互動元件 aria-label 抽檢；SEC-009 docs/security-jwt-refresh.md；PERF-005/007/009 docs/performance-audit.md；GAME-014 NeverHaveIEver/Roulette/Dice confetti（reducedMotion 不播）；COPY-005 docs/copy-audit-checklist.md；TEST-011 docs/test-subscription-e2e.md；TEST-012 ErrorBoundaryBlock/GameErrorBoundary 單元測試；DEV-006 pre-commit 註解 DEPLOYMENT；DEV-009 depcheck 註解；DEV-012 本輪 CHANGELOG。
- **P1 下一批 20 任務（2026-02-13）**：A11Y-012/UX-003 觸控目標 48px；UX-006 圖示統一 lucide；UX-008 深淺主題對比；UX-010 遊戲/學習 CTA 一致；I18N-005 API 錯誤多語（api-error-i18n）；I18N-006 課程/遊戲可譯策略；COPY-001 Hero CTA A/B（ctaVariant0/1）；COPY-004 訂閱 FAQ 連結；COPY-007 onboarding 步驟；SEC-007 CSP 註解；SEC-008 docs/auth-turnstile-flow.md；PERF-004 next/image；PERF-008 API Cache-Control（subscription、scripts）；GAME-004 房主離開房間處置；GAME-005 邀請連結 i18n；GAME-010 音效/觸覺可開關；GAME-016 密碼房錯誤友善提示；TEST-010 遊戲邏輯單元測試（truth-or-dare、never-have-i-ever、who-most-likely、secret-reveal）；DEV-012 本輪 CHANGELOG。
- **P1 20 任務批次（2026-02-13）**：TEST-007/009/013；UX-012/007；COPY-002/006/008；A11Y-007/008/009/010/011（標題階層、prefers-reduced-motion、圖片 alt、aria-live）；SEC-006 XSS 審計（docs/security-xss-audit.md）；SEC-010 環境變數審計（docs/security-env-audit.md）；PERF-003 GameLazyMap 懶加載審計；I18N-004 日期依 locale 格式化（ScriptMurderRoom、assistant formatDateTime）；P0-R2-STATUS 更新。
- 合併計畫（Script-Murder + 遊戲列表）：Supabase project ref 統一為 wdegandlipgdvqhgmoai；API scripts/rooms 錯誤時回傳 `_fallback: true`；script-murder 頁面解析 _fallback 顯示連線錯誤（scriptMurder.connectionError i18n）；docs/game-list-scoring-research.md 評分研究；移除 5 款遊戲（finger-guessing, coin-flip, truth-wheel, fortune-draw, finger-point）；TASKS-170 新增 GAME-OPT-001～010 個別遊戲優化任務。
- 自動檢查優化：validate-env 偵測 etrqxhpbhimrkcyolbrr 並警告改用 wdegandlipgdvqhgmoai；.env.example 更新正確專案 URL；health API hint 加強 DNS/ENOTFOUND 提示；docs/script-murder-setup.md 劇本殺設定指南；移除 SpinBottle smoke 測試（已從遊戲列表移除）。
- Script-murder 擴充至 8 支完整劇本：seed migrations 第五～第八支（職場酒局、旅行團疑雲、婚宴風波、新年派對）；第四支「醉後告白」已可套用。GET /api/scripts 回傳 chapterCount/roleCount；大廳卡片顯示章節·角色數、loading 骨架 8 張、免費方案前 4 支可玩（freeScriptLimit=4）。game-batch5-audit GAME-019 更新。
- Script-murder 空表自動種子：GET /api/scripts 當 scripts 表為空時自動寫入 8 支劇本與最少章節/角色（lib/seed-script-murder.ts）；大廳空狀態新增「重新載入」按鈕與 noScriptsHint 說明；fetchScripts 非 2xx 時顯示 API 錯誤、重試前清除錯誤。
- SEC-003 本批 6 支 API Zod 補齊：script-murder、recommend、report、learn/notes、learn/certificate、subscription/promo（api-body-schemas.ts + 各 route safeParse/errorResponse）；api-zod-audit、TASKS-170 更新。
- Phase B 剩餘任務：SEC/PERF 審計補註（performance-audit PERF-014 勾選）；A11Y-001/002/017 抽檢勾選（accessibility-audit-checklist）；E2E 關鍵路徑穩化（dismissAgeGate、定價 FAQ 先 dismiss cookie、I18N cookie url、playwright timeout 60s/expect 15s、Nav 選器放寬、docs/e2e-critical-paths.md、REAL_COMPLETION_RATE Phase B 註）；B4 可選項文件註明（COPY-011/012/013、GAME-018 於 copy-batch4-audit、game-batch5-audit）；TASKS-170 Phase 2 續 Phase B 列。
- Phase 2 續（50 任務批次，三支柱）：COPY-005 課程學習目標（wine-101、whisky-101、white-wine 補 learningObjectives，LearnCourseContent 首屏展示）；GAME-014 真心話大冒險完成/下一輪 confetti（reducedMotion 時不播放）；copy-audit-checklist 補 COPY-005 驗收；validate:lessons、validate:content 通過；TASKS-170、CHANGELOG 更新。
- Phase 2 續（下一批續 4，30 任務批次）：PERF-001/002 測量填表、A11Y-003 抽檢、PERF-014 驗收；檢查清單與審計（A11Y、COPY、api-zod、dev-batch7、ux-batch3、game-batch5、accessibility 頁）；API Zod 補齊（chat、games/rooms POST・PATCH、learn/progress）並更新 api-zod-audit；派對房暱稱 input onFocus scrollIntoView、A11Y-017 PunishmentWheel 鍵盤與 aria-label、ShareToStory 關閉鈕 aria-label、DEV-004 console 審計（dev-batch7）、SEC-013/PERF-015 註解（rooms 密碼 hash、next.config Link prefetch）；ts-any-plan、CONTRIBUTING E2E 可選、TASKS-170 下一批續 4。
- Phase 2 續（下一批續 3）：A11Y-001/002 驗收步驟與抽檢清單、A11Y-017 具體元件名（accessibility-audit-checklist）；PERF-001 填表指引、PERF-002 Lighthouse 測量步驟（performance-audit）；api-zod-audit、rls-audit-next 勾選或註明；COPY-006/009 抽檢方法、UX-004 建議實作位置與登入頁 onFocus scrollIntoView（login/page.tsx）；TASKS-170 Phase 2 續「下一批續 3」。
- Phase 2 續（下一批續 2）：A11Y-003/009/015/016/017 檢查清單與抽檢項（accessibility-audit-checklist）；PERF-014/019/020 驗收與註明（performance-audit、README 靜態 CDN）；UX-004 鍵盤遮擋現狀、UX-002 訂閱/join 失敗勾選（ux-copy-checklist）；COPY-006/009（copy-audit-checklist）；I18N-006 課程/遊戲名稱可譯策略（i18n-guide）；SEC-010 .env 敏感變數註解、DEV-014/015 dev-checklist 條目；TASKS-170 Phase 2 續完成紀錄「下一批續 2」。
- Phase 2 續（下一批 80）：DKIM/Resend `docs/email-dkim-setup.md`、`.env.example` 註解；`docs/security-headers.md`（X-Frame-Options、CSP、CSP_REPORT_ONLY）；SEC-002 RLS 審計 `rls-audit-next.md`、ai_feedback InitPlan migration；SEC-003 API Zod（leave/join/subscription/verify-turnstile）`src/lib/api-body-schemas.ts`；SEC-008 `docs/auth-turnstile-flow.md`；SEC-014/015 dev-checklist、CONTRIBUTING audit、SENSITIVE_KEYS 擴充；PERF-001/002 performance-audit 表格；GAME-005 邀請 i18n（gamesRoom.inviteCopyAria/copyLink/inviteQR）、GamesPageClient 替換硬編碼；I18N-011/012 i18n-guide 已有 E2E 多語說明。
- Phase 2 續（下一批續）：PERF-003/008/013 註解與檢查項（performance-audit.md）；A11Y-005/006/013 skip link、modal Esc、E2E axe 勾選（accessibility-audit-checklist）；COPY-003/004 錯誤頁與訂閱 FAQ 勾選（copy-audit-checklist）；GAME-007/008 已文件化於 game-batch5-audit；TEST-015、DEV-013 已於 test-batch6、dev-batch7；TASKS-170 Phase 2 續完成紀錄更新。
- Phase 2 續（下一批 35）：審計文件（RLS、API Zod、PERF-001/002、A11Y-003、I18N-002）；A11Y-004/007/008/010/012、UX-013；GAME-011/013/014/017/020、COPY-010、I18N-009；TEST/SEC/PERF 文件；DEV-011/012；`docs/api-zod-audit.md`、`docs/security-audit-notes.md`、`docs/ts-any-plan.md`、`docs/copy-audit-checklist.md`、`docs/i18n-validation.md`；zh-CN 三語 key 補齊（`scripts/merge-i18n-keys.mjs`、`check:i18n:three`）。
- P2-250: Code splitting strategy documentation (`docs/code-splitting.md`).
- P2-261: Component and file naming conventions (`docs/naming-conventions.md`).
- P2-265: This CHANGELOG; future releases should append under version headings.
- P2-266: Contributing guide (`CONTRIBUTING.md`).
- P2-280: Dependency graph documentation placeholder (`docs/dependency-graph.md`).

### Changed

- P2-271: `GAME_CATEGORY_BY_ID` in `games.config.ts` now uses `Map` for lookup performance.
- P2-245: `canvas-confetti` in `lib/celebration.ts` loaded via dynamic import to reduce main bundle.
- P2-322: `lib/errors.ts` extended with `ServerError` and 4xx/5xx classification.
- P2-303 / P2-327: Middleware logs request ID, method, path, status, and response time for API routes.
- P2-314: API request body size limit configured in Next.js (when applicable).
- P2-246: Error boundaries documented and used for game and assistant blocks.
- P2-260: Third-party scripts use `next/script` with appropriate strategy where applicable.
- P2-263: Git hooks (Husky + lint-staged) for pre-commit lint/format.
- P2-273: Key data-fetching hooks use `AbortController` to cancel requests on unmount.
- P2-267: API routes use `headers()` from `next/headers` where appropriate for consistency.

### Fixed

- (None in this batch.)

## [1.0.0] - 2025-xx-xx

- Initial production-ready release (see report for full P0/P1/P2 scope).
