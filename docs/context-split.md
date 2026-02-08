# P2-239：Context 審計與拆分建議

審計結果：目前多為單一職責 Context，僅 `UserContext` 承載較多狀態。

## 現有 Context 一覽

| Context | 職責 | 建議 |
|--------|------|------|
| I18nContext | locale、t()、setLocale | 保持 |
| UserContext | 用戶 session、profile、loading | 若再擴充「偏好」「通知」可拆出 |
| ApiLoadingContext | 全站 API 載入狀態 | 保持 |
| ErrorAnnouncerContext | 無障礙錯誤播報 | 保持 |
| NavVisibilityContext | 導航顯示/隱藏 | 保持 |
| ThemeContext | 主題 | 保持 |
| ToastContext | Toast | 保持 |
| PassPhoneProvider | 特定流程 | 保持 |

## 拆分建議

- **UserContext**：若未來加入「訂閱狀態」「通知未讀數」等，可拆為：
  - `AuthContext`：僅 session、user、signOut。
  - `UserProfileContext`：profile、preferences。
  - 或維持單一 UserContext，以 `useReducer` 分 sub-state 降低重渲染範圍。
- **原則**：新功能優先考慮「是否可塞進既有 Context 且不造成大範圍 re-render」；若會，再拆成小 Context 或遷移到 Zustand/Jotai。
