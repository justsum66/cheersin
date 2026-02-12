# SEC-001：公開 API 限流涵蓋

本文件列出對外/高頻 API 的 rate limiting 實作，確保未認證或高頻請求回傳 429 與 `Retry-After`。

## 限流實作

- **引擎**：`src/lib/rate-limit.ts`（in-memory，單實例）；`src/lib/rate-limit-upstash.ts`（可選 Upstash）。
- **識別**：`getClientIp(request.headers)`（x-forwarded-for / x-real-ip）。

## 已限流路由

| 路由 | 方法 | Context | 閾值（/分鐘） |
|------|------|---------|----------------|
| `/api/games/rooms` | POST | create | 10 |
| `/api/games/rooms/[slug]/join` | POST | join | 30 |
| `/api/games/rooms/[slug]/game-state` | POST | game_state | 30 |
| `/api/report` | POST | （預設） | 60 |
| `/api/recommend` | POST | （預設） | 60 |
| `/api/chat` | POST | （Upstash） | 依 Upstash 設定 |
| `/api/subscription` | POST | subscription | 20 |
| `/api/upload` | POST | upload | 15 |

## 回應

- 被限流時：`429` + `Retry-After: 60`（秒），body 含錯誤碼/訊息。

## 備註

- 需分散式限流時改用 Upstash（見 `rate-limit-upstash.ts`）。
- 新增公開 POST API 時應在此表補上並在 route 內呼叫 `isRateLimited(ip, context)`。
