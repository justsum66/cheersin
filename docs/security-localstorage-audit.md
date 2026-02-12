# SEC-004：localStorage 審計與敏感資料

僅 non-sensitive 或可接受持久化之資料存 localStorage；敏感或個人對話建議 sessionStorage 或後端。

## 審計結果摘要

- **密碼 / Token**：未發現存於 localStorage。
- **可能敏感**：助理聊天記錄（`assistant` 頁 CHAT_HISTORY_KEY）— 建議改 sessionStorage 或產品決策後註明。
- **其餘**：遊戲統計、偏好、學習進度、UI 設定等，視為 non-sensitive，可保留 localStorage。

## 依 key/用途分類

| 用途 | 位置 | Key/常數 | 敏感？ | 備註 |
|------|------|----------|--------|------|
| 遊戲統計 | GamesPageClient, profile, gamification | GAMES_STATS, STORAGE_KEYS.GAMES_STATS, KEYS.POINTS 等 | 否 | |
| 最近遊戲 | GamesPageClient | RECENT_GAMES_KEY | 否 | |
| 教學完成 | GamesPageClient | TUTORIAL_DONE_KEY | 否 | |
| 房間加入/玩家列表 | GamesPageClient | ROOM_JOINED_KEY, STORAGE_KEY | 否 | 僅房間 ID/列表 |
| **助理聊天記錄** | assistant/page | CHAT_HISTORY_KEY | **可能** | 建議 sessionStorage 或註明 |
| 偏好/測驗/願望清單 | assistant, quiz, profile | TASTE_PREFERENCES_KEY, QUIZ_*, WISHLIST_KEY | 否 | |
| 訂閱取消時間 | subscription/cancel, subscription-retention | CANCELLED_AT_KEY | 否 | |
| Cookie 同意 | CookieConsentBanner | STORAGE_KEY | 否 | |
| 主題/字體/無障礙 | ThemeContext, FontSizeControl, games-settings | cheersin-theme, FONT_SIZE_KEY, KEY_* | 否 | |
| 訂閱 tier/試用 | subscription.ts | STORAGE_KEY_TIER, STORAGE_KEY_AI_* 等 | 否 | 非密碼 |
| 學習進度/書籤/筆記 | learn, LearnCourseContent, learn-* | PROGRESS_KEY, KEY, CERT_NAME_KEY | 否 | |
| 遊戲設定/音效/收藏 | games-settings, useGameSound, games-favorites | KEY_*, STORAGE_*, FAVORITES_KEY | 否 | |
| 登入相關 | login/page | （redirect 等） | 否 | 未存 token |
| PWA A2HS | AddToHomeScreenBanner | A2HS_DISMISS_KEY | 否 | |
| 錯題/最後 session | wrong-answers, games-last-session, games-weekly | 各 KEY | 否 | |

## 建議

1. **助理聊天記錄**：若產品定義為敏感，改為 `sessionStorage` 或僅記憶體；否則在隱私政策註明並保留現狀。
2. 新增使用 localStorage 時，先評估是否為個人可識別/對話內容，敏感則用 sessionStorage 或後端。
3. 本審計日期後之新增 key 請同步更新此表。
