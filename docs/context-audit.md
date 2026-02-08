# Context 審計與拆分建議 (P2-239)

## 現有 Context 一覽

| Context | 職責 | 建議 |
|--------|------|------|
| **UserContext** | user, setUser, isLoading, setLoading；接 Supabase Auth | 維持單一，職責清晰。若未來加入訂閱狀態可考慮拆出 SubscriptionContext。 |
| **I18nContext** | locale, setLocale, t(), localeNames, locales | 已單一職責，無需拆分。 |
| **ApiLoadingContext** | 全域 API 載入狀態 | 可與 ErrorAnnouncer 合併為「請求狀態」Context，或維持現狀。 |
| **ErrorAnnouncerContext** | 錯誤朗讀/無障礙 | 可選與 ApiLoading 合併。 |
| **NavVisibilityContext** | 導航顯示/隱藏 | 獨立合理。 |
| **ThemeContext** | 主題 | 獨立合理。 |
| **ToastContext** | Toast | 獨立合理。 |
| **PassPhoneProvider** | 傳遞 phone（表單等） | 若僅單頁使用可改為 props。 |

## 結論

目前無單一「巨型」Context。UserContext 僅 4 個值，更新粒度可接受。若未來在 UserContext 內加入訂閱、偏好、通知等，建議拆成：

- `AuthContext`：user, isLoading
- `SubscriptionContext`：tier, expiresAt（可選）

現階段**無需強制拆分**，僅需新增功能時避免塞入同一 Context 過多不相關狀態。
