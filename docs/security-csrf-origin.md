# SEC-005：CSRF / Origin 檢查

## 概述

`src/middleware.ts` 對狀態變更的 API 要求 `Origin` 或 `Referer` 為同源或可信來源，降低 CSRF 風險。

## 適用範圍

- **適用**：`/api/*` 的 `POST`、`PUT`、`PATCH`、`DELETE` 請求
- **排除**：
  - `/api/webhooks/*`（PayPal、Supabase 等外部回調）
  - `/api/auth/*`（OAuth callback、Supabase auth）

## 允許來源

依 `getAllowedOriginPrefixes()` 動態計算：

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_APP_URL` | 應用網址（生產必設） |
| `VERCEL_URL` | Vercel 自動注入，如 `https://xxx.vercel.app` |
| 固定 | `http://localhost`（本機開發） |

比對規則：`Origin` 或 `Referer` 必須等於或前綴符合任一允許來源。

## 拒絕行為

- 開發模式（`NODE_ENV !== production`）：若無 Origin/Referer，放行
- 生產模式：無 Origin/Referer 或不在白名單 → 403，`{ "error": "Invalid origin" }`

## 相關程式

- `src/middleware.ts`：`isAllowedOrigin`、`isStateChange`、`skipCsrf` 邏輯
- 受保護 API：`/api/games/rooms`（建立/加入）、`/api/subscription`、`/api/chat`、`/api/recommend` 等 POST
