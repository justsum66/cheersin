# P2-257：Monorepo 考量（可選）

若未來需管理後台、移動端等多應用，可考慮以 Turborepo 或 Nx 建立 Monorepo，共享代碼與配置。

## 適用情境

- 多個 Next.js 應用（例如：主站 + 管理後台）
- 共享 `packages/ui`、`packages/config-eslint`
- 行動端（React Native / Expo）與網頁共用邏輯

## 工具比較

| 工具 | 優點 | 適用 |
|-----|------|------|
| Turborepo | 與 Vercel 整合佳、快取簡單 | Next.js 多應用 |
| Nx | 依賴圖、受影響分析、較重 | 大型團隊 |

## 建議結構（Turborepo）

```
apps/
  web/          # 現有 Cheersin Next.js
  admin/        # 管理後台（可選）
packages/
  ui/           # 共享組件
  config-eslint/
  tsconfig/
```

## 當前狀態

單一 Repo 已足夠現階段產品；本文件供未來擴充參考。
