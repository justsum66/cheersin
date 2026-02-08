# P2-288：API 版本控制策略

為未來重大變更提供向後相容，建議採用路徑版本號。

## 策略

- **路徑版本**：`/api/v1/...`，新 breaking 變更時新增 `v2`，舊客戶端仍可呼叫 `v1`。
- **預設**：目前所有路由在 `/api/*`（視為 v1 相容）。正式引入版本時可：
  - 新增 `app/api/v1/` 目錄，將現有 route 以 re-export 或 proxy 方式指向現有實作；
  - 或保留 `/api/*` 為 v1 別名，新功能僅在 `/api/v2/*` 提供。

## 範例結構（未來遷移時）

```
app/api/
  route.ts          → 可選：重導向或說明
  v1/
    chat/route.ts   → 現有 chat 邏輯
    subscription/route.ts
    ...
  v2/
    chat/route.ts   → 新版（若 breaking）
```

## 回應頭建議

- `X-API-Version: 1`（或 `v1`）讓客戶端辨識版本。
- Deprecation：舊版將棄用時可加 `Deprecation: true` 或 `Sunset: <date>`。

## 實作時程

- 當前：所有 API 維持 `/api/*`，在 middleware 或單一 wrapper 可注入 `X-API-Version: 1`。
- 當有第一個 breaking 變更時：新增 `v2` 路徑，並在文件中標註 v1 日落時間。
