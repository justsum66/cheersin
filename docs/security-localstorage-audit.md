# SEC-004：localStorage 審計

## 儲存內容分類

### 1. 使用者偏好（非敏感）

| Key / 模組 | 用途 | 檔案 | 風險 |
|------------|------|------|------|
| games-settings | 字級、減少動畫、觸覺、傳手機 | lib/games-settings.ts | 低 |
| FONT_SIZE_KEY | 字級 | FontSizeControl.tsx | 低 |
| TUTORIAL_DONE_KEY | 教學完成 | GamesPageClient.tsx | 低 |
| A2HS_DISMISS_KEY | 加到主畫面已關閉 | AddToHomeScreenBanner.tsx | 低 |
| CookieConsentBanner STORAGE_KEY | Cookie 同意 | CookieConsentBanner.tsx | 低 |
| useGameSound | 音效開關、音量、BGM | useGameSound.ts | 低 |

### 2. 遊戲/學習進度（單機）

| Key / 模組 | 用途 | 檔案 | 風險 |
|------------|------|------|------|
| STORAGE_KEYS.GAMES_STATS | 遊戲次數 | GamesPageClient.tsx | 低 |
| RECENT_GAMES_KEY | 最近遊戲 | GamesPageClient.tsx | 低 |
| ROOM_JOINED_KEY | 房間加入狀態 | GamesPageClient.tsx | 低 |
| STORAGE_KEY (players) | 玩家名單 | GamesPageClient.tsx | 低 |
| PROGRESS_KEY | 課程進度 | LearnCourseContent, learn/page | 低 |
| gamification KEYS | 積分、連續天數、徽章等 | lib/gamification.ts | 低 |
| WRONG_ANSWERS_KEY | 錯題本 | lib/wrong-answers.ts | 低 |
| games-favorites / RATINGS | 收藏、評分 | lib/games-favorites.ts | 低 |
| useGamePersistence | 遊戲存檔 | useGamePersistence.ts | 低 |
| games-last-session | 最後遊戲 | lib/games-last-session.ts | 低 |
| games-weekly | 每週數據 | lib/games-weekly.ts | 低 |

### 3. 測驗/助理（含使用者產生內容）

| Key | 用途 | 檔案 | 風險 |
|-----|------|------|------|
| quiz-last-result / QUIZ_* | 測驗結果、歷史 | quiz/page, HomePageClient, profile | 低，非 PII |
| CHAT_HISTORY_KEY | 助理對話歷史 | assistant/page | 中，可能含個人敘述 |
| TASTE_PREFERENCES_KEY | 口味偏好 | assistant/page | 低 |
| QUIZ_RESULT_KEY | 靈魂酒測結果 | assistant/page | 低 |
| WISHLIST_KEY | 願望清單 | assistant, profile, wishlist.ts | 低 |
| cheersin_wishlist | 願望清單（舊 key） | profile | 低 |

### 4. 訂閱/UTM（需注意）

| Key | 用途 | 檔案 | 風險 |
|-----|------|------|------|
| CANCELLED_AT_KEY | 取消時間 | subscription/cancel, subscription-retention | 低 |
| login UTM keys | UTM 參數 | login/page | 低，非敏感 |

### 5. 自訂題目（TruthOrDare）

| Key | 用途 | 檔案 | 風險 |
|-----|------|------|------|
| TruthOrDare STORAGE_KEY | 自訂真心話/大冒險 | TruthOrDare.tsx | 低 |

## 安全檢查

- [x] 無密碼、Token 存 localStorage
- [x] 無信用卡等支付資訊
- [x] 聊天歷史為使用者本地，未上傳未經同意
- [x] 願望清單、偏好等為 UX 用途
- [ ] 若未來儲存 email 或可識別資訊，需加密或改用 sessionStorage/HttpOnly cookie

## 建議

1. 新 key 請經 `lib/constants.ts` 集中管理
2. 敏感度提升時，考慮加密或移出 localStorage
3. PWA 離線時 localStorage 仍可用，注意容量

**更新日期**：2025-02-12
