# SEC-001：API Rate Limiting 覆蓋審計

## 實作現況

- **來源**：`src/lib/rate-limit.ts`、`src/lib/rate-limit-upstash.ts`
- **策略**：Upstash Redis 優先，未設定時 fallback in-memory
- **識別碼**：`getClientIp(headers)`（x-forwarded-for / x-real-ip）
- **context 與限額**（`isRateLimited` / `isRateLimitedAsync`）：
  - `create`：10/min（建立房間）
  - `join` / `game_state`：30/min
  - `subscription`：20/min
  - `upload`：15/min
  - 其他（含 `recommend`、`report`）：60/min

## 覆蓋清單

| Route | Rate Limit | Context | 備註 |
|-------|------------|---------|------|
| POST /api/games/rooms | ✅ | create | |
| POST /api/games/rooms/[slug]/join | ✅ | join | |
| GET /api/games/rooms/[slug]/game-state | ✅ | game_state | |
| POST /api/subscription | ✅ | subscription | |
| POST /api/upload | ✅ | upload | |
| POST /api/recommend | ✅ | recommend | 60/min |
| POST /api/report | ✅ | report | 60/min |
| POST /api/chat | ✅ | 自訂（tier 依 subscription） | checkRateLimit/Upstash |
| 其他 API | ❌ | 未套用 | 見下方建議 |

## 未套用限流之敏感/高頻 API（建議優先）

| Route | 建議 |
|-------|------|
| POST /api/auth/verify-turnstile | 登入相關，建議 10–20/min |
| POST /api/auth/login-failure | 失敗次數追蹤，建議限流 |
| POST /api/learn/progress | 可考慮 60/min |
| POST /api/learn/notes | 可考慮 30/min |
| POST /api/analytics | 可考慮 100/min |
| POST /api/generate-invitation | 可考慮 20/min |
| POST /api/trivia/questions | 可考慮 30/min |
| POST /api/truth-or-dare-external | 可考慮 30/min |

## 檢查結果

- [x] 遊戲房間 create/join/game-state 已限流
- [x] subscription、upload 已限流
- [x] chat 有 tier 化限流
- [ ] auth verify-turnstile 未限流
- [ ] 部分學習與遊戲相關 API 未限流

**更新日期**：2025-02-12
