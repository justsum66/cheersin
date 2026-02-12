# RWD 斷點策略（P2-268 / UX-009）

- **設計原則**：Mobile-first；Tailwind 使用 `theme.extend.screens`（來自 `src/lib/design-tokens.ts`）。
- **三斷點對應**：mobile（&lt; 768px）、tablet（768px～1024px）、desktop（≥ 1024px）；與 Tailwind `md`/`lg` 一致，無錯位。
- **斷點**：`sm: 640px`、`md: 768px`、`lg: 1024px`、`xl: 1280px`、`2xl: 1536px`。
- **測試**：關鍵路徑 E2E 含手機 viewport（`critical-paths.spec.ts`）；新區塊需在 375px 與 768px 檢查不破版。
- **元件**：導航、表單、遊戲區需在 `max-w` 與 `px` 上使用斷點（如 `md:px-6`、`lg:max-w-4xl`），避免小螢幕橫向溢出。
