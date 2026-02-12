# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
