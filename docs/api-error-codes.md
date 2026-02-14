# API 錯誤碼一覽

所有 API 錯誤回應格式：`{ success: false, error: { code: string, message: string } }`。  
錯誤碼與訊息定義於 `src/lib/api-error-codes.ts`，為單一來源。

## 遊戲房間（ROOM_*）

用於 `/api/games/rooms`、`/api/games/rooms/[slug]/*`。

| code (ROOM_ERROR) | 典型 message (ROOM_MESSAGE) |
|-------------------|-----------------------------|
| Invalid slug | 房間代碼格式不正確 |
| Room not found | 找不到該房間 |
| displayName required | 請輸入顯示名稱 |
| INVALID_PASSWORD | 房間密碼錯誤 |
| ROOM_FULL | 房間已滿 |
| Player not in room | 找不到該玩家 |
| Host only / Forbidden | 僅房主可修改設定 |
| Game ended | 本局已結束 |
| Not a script room | 此房間不是劇本殺房 |
| ROOM_CREATE_LIMIT | 暫時無法建立房間，請稍後再試 |
| Invalid script | 劇本不存在或無法使用 |
| UPGRADE_REQUIRED | 免費方案僅支援 4 人，升級可解鎖 12 人 |
| 其他 | 見 `src/lib/api-error-codes.ts` ROOM_* |

## 學習（LEARN_*）

用於 `/api/learn/*`（notes、certificate、discussions、tasting-notes、progress）。

| code (LEARN_ERROR) | 典型 message (LEARN_MESSAGE) |
|--------------------|-----------------------------|
| UNAUTHORIZED | Unauthorized |
| COURSE_ID_REQUIRED | courseId required |
| DB_NOT_CONFIGURED | Database not configured |
| DB_ERROR | （動態：error.message） |
| INVALID_JSON / INVALID_BODY | Invalid JSON / courseId and content required |
| CONTENT_TOO_LONG | content too long |
| COURSE_NOT_FOUND | Course not found |
| COURSE_NO_CHAPTERS | Course has no chapters |
| COURSE_NOT_COMPLETED | Course not completed |
| WINE_NAME_REQUIRED | wine_name is required |
| INVALID_RATING | rating must be 1–5 integer |
| Bad request | courseId 與 chapterId 為必填且有效 |
| 其他 | 見 `src/lib/api-error-codes.ts` LEARN_* |

## 管理後台（ADMIN_*）

用於 `/api/admin/*`（knowledge、knowledge/[id]、users、usage）。需 `x-admin-secret` 或 NODE_ENV=development。

| code (ADMIN_ERROR) | 典型 message (ADMIN_MESSAGE) |
|--------------------|-----------------------------|
| UNAUTHORIZED | Unauthorized |
| SERVICE_NOT_CONFIGURED | Supabase not configured |
| INVALID_BODY | title, course_id, chapter, content required |
| ID_REQUIRED | id required |
| NOT_FOUND | Doc not found |
| EMBEDDING_FAILED | Embedding failed |
| FIELD_LENGTH_EXCEEDED | （動態：title/course_id/chapter/content 上限） |
| Missing query | 請提供查詢參數 q（email 或 user id） |
| Invalid JSON / Missing userId / Invalid tier | 請提供有效的 JSON body / 請提供 userId / subscription_tier 須為… |
| User not found | 找不到該用戶 |

前端可依 `error.code` 做 i18n 或 fallback 至 `error.message`。
