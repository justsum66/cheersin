# 組件與檔案命名規範

本文件定義 Cheersin 前端組件與相關檔案的命名約定，確保團隊一致與可維護性。

## 組件檔案

- **PascalCase**，與導出組件名一致：`Button.tsx`, `GameCard.tsx`, `ModalCloseButton.tsx`。
- 一個檔案導出一個主要組件；若有多個相關組件，目錄內可有多個檔案（如 `ui/Button.tsx`, `ui/ButtonGroup.tsx`）。

## 頁面與路由

- **App Router**：目錄與檔案名使用 **kebab-case**（如 `subscription/cancel/page.tsx`），對應 URL `/subscription/cancel`。
- **layout.tsx / loading.tsx / error.tsx** 等 Next 約定檔名保持小寫。

## 工具與配置

- **lib**：小寫或 camelCase 檔名，如 `api-response.ts`, `fetch-with-timeout.ts`, `games-settings.ts`。
- **config**：小寫 + 用途，如 `games.config.ts`, `home.config.ts`, `toast.config.ts`。

## 測試與 E2E

- 單元/煙測：`*.test.ts` 或 `*.test.tsx`，與被測檔案同目錄或置於 `__tests__/`。
- E2E：`e2e/*.spec.ts`，檔名描述場景（如 `critical-paths.spec.ts`）。

## 常數與類型

- **常數**：全大寫 + 底線，如 `RECENT_GAMES_MAX`, `GUEST_TRIAL_LIMIT`。
- **類型/介面**：PascalCase，如 `GameWithCategory`, `DisplayCategory`。

遵守上述規範可降低認知負荷並便於搜尋與重構。
