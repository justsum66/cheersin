# 代碼分割策略 (Code Splitting)

本文件記錄 Cheersin 專案的代碼分割策略，供團隊理解與維護。

## 頁面級 (Route-level)

- **Next.js App Router** 依目錄自動做 route-based code splitting，每個 `app/**/page.tsx` 對應一個 chunk。
- **動態路由**（如 `/learn/[courseId]`）使用 `generateStaticParams` 預生成靜態頁時，仍會按 route 分割。

## 組件級 (Component-level)

- **P0-018 遊戲大廳**：`GamesPageClient.tsx` 內對 `Lobby` 使用 `React.lazy(() => import('@/components/games/Lobby'))`，非首屏遊戲列表懶加載，降低首屏 bundle。
- **遊戲組件**：各遊戲（如 `Roulette`, `Trivia`）經 `GameLazyMap` / `LazyGame` 動態載入，僅在用戶選擇該遊戲時才載入對應 chunk。
- **prefetch**：`prefetchGame(id)` 在 hover 或預測下一步時預取遊戲模組，加快切換體驗。

## 第三方庫

- **P2-245**：`canvas-confetti` 在 `lib/celebration.ts` 中以動態 import 載入，避免進入主包。
- 大型 UI 庫（如 `framer-motion`, `lottie-react`）已透過 Next.js 的 `optimizePackageImports` 做 tree-shake 與按需載入。

## 約定

- 新增「非首屏」或「體積較大」的組件時，優先考慮 `React.lazy` + `Suspense`。
- 新增路由時無需手動配置，App Router 會自動分割。
- 避免在首屏路徑直接 `import` 體積大的第三方庫，改為動態 `import()`。
