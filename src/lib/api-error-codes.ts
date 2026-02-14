/**
 * API 錯誤碼與使用者訊息常數 — 單一來源，供 route 與前端 i18n 對齊
 * 回傳格式：errorResponse(status, code, { message })
 */

/** Rate limit 逾限時使用者訊息（429） */
export const RATE_LIMIT_MESSAGE = '操作過於頻繁，請稍後再試' as const

/** 遊戲房間相關（/api/games/rooms、/api/games/rooms/[slug]/*） */
export const ROOM_ERROR = {
  INVALID_SLUG: 'Invalid slug',
  ROOM_NOT_FOUND: 'Room not found',
  INVALID_BODY: 'Invalid body',
  DISPLAY_NAME_REQUIRED: 'displayName required',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  ROOM_FULL: 'ROOM_FULL',
  PLAYER_NOT_IN_ROOM: 'Player not in room',
  ROOM_NOT_FOUND_OR_EXPIRED: '房間不存在或已過期',
  HOST_ONLY: 'Host only',
  FORBIDDEN: 'Forbidden',
  GAME_ENDED: 'Game ended',
  NOT_SCRIPT_ROOM: 'Not a script room',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  INVALID_PARTY_STATE: 'INVALID_PARTY_STATE',
  MISSING_PLAYER_OR_OPTION: 'Missing playerId or option',
  INVALID_PLAYER: 'Invalid player',
  INVALID_ACTION: 'Invalid action',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_JSON: 'Invalid JSON',
  BAD_REQUEST: 'Bad request',
  ROOM_CREATE_LIMIT: 'ROOM_CREATE_LIMIT',
  INVALID_SCRIPT: 'Invalid script',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
} as const

export const ROOM_MESSAGE = {
  INVALID_SLUG: '房間代碼格式不正確',
  ROOM_NOT_FOUND: '找不到該房間',
  INVALID_BODY: '請輸入顯示名稱',
  DISPLAY_NAME_REQUIRED: '請輸入顯示名稱',
  INVALID_PASSWORD: '房間密碼錯誤',
  ROOM_FULL: '房間已滿',
  PLAYER_NOT_IN_ROOM: '找不到該玩家',
  ROOM_NOT_FOUND_OR_EXPIRED: '房間不存在或已過期',
  HOST_ONLY: '僅房主可修改設定',
  FORBIDDEN: '僅房主可修改設定',
  GAME_ENDED: '本局已結束',
  NOT_SCRIPT_ROOM: '此房間不是劇本殺房',
  HOST_ONLY_SCRIPT: '僅房主可推進章節',
  MISSING_PLAYER_ID: '缺少玩家識別',
  MISSING_PLAYER_OR_OPTION: '缺少 playerId 或 option',
  INVALID_PLAYER: '無效的玩家',
  INVALID_ACTION: '無效的 action',
  LOGIN_REQUIRED: '請先登入',
  INVALID_JSON_BODY: '請提供有效的 JSON body',
  BAD_REQUEST_HOST_OR_LIST: 'Use host=me to list your rooms or list=active for active party rooms',
  ROOM_CREATE_LIMIT: '暫時無法建立房間，請稍後再試',
  INVALID_SCRIPT: '劇本不存在或無法使用',
  UPGRADE_REQUIRED: '免費方案僅支援 4 人，升級可解鎖 12 人',
} as const

/** 學習 API 相關（/api/learn/*） */
export const LEARN_ERROR = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  COURSE_ID_REQUIRED: 'COURSE_ID_REQUIRED',
  DB_NOT_CONFIGURED: 'DB_NOT_CONFIGURED',
  DB_ERROR: 'DB_ERROR',
  INVALID_JSON: 'INVALID_JSON',
  INVALID_BODY: 'INVALID_BODY',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  COURSE_NO_CHAPTERS: 'COURSE_NO_CHAPTERS',
  COURSE_NOT_COMPLETED: 'COURSE_NOT_COMPLETED',
  WINE_NAME_REQUIRED: 'WINE_NAME_REQUIRED',
  INVALID_RATING: 'INVALID_RATING',
  BAD_REQUEST: 'Bad request',
} as const

export const LEARN_MESSAGE = {
  UNAUTHORIZED: 'Unauthorized',
  COURSE_ID_REQUIRED: 'courseId required',
  DB_NOT_CONFIGURED: 'Database not configured',
  CONTENT_TOO_LONG: 'content too long',
  COURSE_ID_AND_CONTENT: 'courseId and content required',
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_NO_CHAPTERS: 'Course has no chapters',
  COURSE_NOT_COMPLETED: 'Course not completed',
  WINE_NAME_REQUIRED: 'wine_name is required',
  INVALID_RATING: 'rating must be 1–5 integer',
  INVALID_JSON: 'Invalid JSON',
  LOGIN_REQUIRED: '請先登入',
  BAD_REQUEST_PROGRESS: 'courseId 與 chapterId 為必填且有效',
  INVALID_JSON_BODY: '請提供有效的 JSON',
} as const

/** Admin API 相關（/api/admin/*） */
export const ADMIN_ERROR = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVICE_NOT_CONFIGURED: 'SERVICE_NOT_CONFIGURED',
  INVALID_BODY: 'INVALID_BODY',
  ID_REQUIRED: 'ID_REQUIRED',
  NOT_FOUND: 'NOT_FOUND',
  EMBEDDING_FAILED: 'EMBEDDING_FAILED',
  FIELD_LENGTH_EXCEEDED: 'FIELD_LENGTH_EXCEEDED',
  MISSING_QUERY: 'Missing query',
  INVALID_JSON: 'Invalid JSON',
  MISSING_USER_ID: 'Missing userId',
  INVALID_TIER: 'Invalid tier',
  USER_NOT_FOUND: 'User not found',
} as const

export const ADMIN_MESSAGE = {
  UNAUTHORIZED: 'Unauthorized',
  SUPABASE_NOT_CONFIGURED: 'Supabase not configured',
  TITLE_COURSE_CHAPTER_CONTENT: 'title, course_id, chapter, content required',
  ID_REQUIRED: 'id required',
  DOC_NOT_FOUND: 'Doc not found',
  EMBEDDING_FAILED: 'Embedding failed',
  MISSING_QUERY: '請提供查詢參數 q（email 或 user id）',
  INVALID_JSON_BODY: '請提供有效的 JSON body',
  MISSING_USER_ID: '請提供 userId',
  INVALID_TIER: 'subscription_tier 須為 free、basic 或 premium',
  USER_NOT_FOUND: '找不到該用戶',
} as const
