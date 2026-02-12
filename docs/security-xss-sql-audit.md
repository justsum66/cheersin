# SEC-006 / SEC-011 / SEC-013 審計摘要

## SEC-006：XSS — 用戶輸入輸出經 sanitize 或 React 轉義

- **dangerouslySetInnerHTML**：全專案僅 [SafeJsonLdScript.tsx](src/components/SafeJsonLdScript.tsx) 使用，且僅 `JSON.stringify(data)` 注入結構化 JSON-LD，無使用者輸入或 API 原始 HTML。
- **政策**：見 [src/lib/sanitize.ts](src/lib/sanitize.ts) 註解；禁止將使用者輸入或 API 回傳的原始 HTML 寫入 dangerouslySetInnerHTML。
- **用戶輸入**：API 端使用 `stripHtml`/`sanitizeHtml`（如 join 的 displayName）；React 預設轉義文字節點。

## SEC-011：SQL 參數化審計

- **實作**：全站 DB 存取經 Supabase client（`createServerClient()`）之 `.from().select().eq().insert().update()` 等，皆為參數化查詢，無字串拼接 SQL。
- **範圍**：src/app/api、src/lib（subscription-lifecycle、chat-history-persist、games-room 等）均無 raw SQL。

## SEC-013：密碼/房間密碼不明文儲存

- **建立房間**：[api/games/rooms/route.ts](src/app/api/games/rooms/route.ts) POST 僅將 `hashRoomPassword(body.password)` 寫入 `password_hash`，不明文儲存。
- **加入房間**：[api/games/rooms/[slug]/join/route.ts](src/app/api/games/rooms/[slug]/join/route.ts) 以 `secureComparePasswordHash` 常數時間比較 hash，不洩漏密碼。
- **實作**：[src/lib/games-room.ts](src/lib/games-room.ts) 提供 `hashRoomPassword`（SHA-256 hex）、`secureComparePasswordHash`（timing-safe）。
