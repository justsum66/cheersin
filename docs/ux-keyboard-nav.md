# UX-018：焦點可見 outline

## 實作

- **focus-visible**：全站互動元件（按鈕、連結、輸入框、Tab）使用 `focus-visible:ring-2 focus-visible:ring-primary-400` 或 `games-focus-ring`，僅鍵盤聚焦時顯示，滑鼠點擊不顯示
- **styles**：`base.css`、`components.css` 定義 `:focus-visible`、`.btn-*:focus-visible`、`.nav-link-ux:focus-visible`、`.input-glass:focus-visible`
- **games.css**：`.game-btn-focus:focus-visible`、`.game-main:focus-visible`
- **驗收**：Tab 導覽時焦點環可見，滑鼠點擊無多餘 outline

---

# UX-004：手機底部導航不被鍵盤完全遮擋

## 實作

- **Navigation.tsx**：`focusin` 監聽 input/textarea/select；手機 (<768px) 時延遲 400ms 後 `bottomNavRef.scrollIntoView({ block: 'end', behavior: 'smooth' })`，確保鍵盤彈起後底部導航仍可 scroll 進入視野
- **登入頁**：email/password 輸入框 `onFocus` 時 `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`，減少鍵盤遮擋
- **main**：`main-content-pb` 提供 5rem + safe-area 底部 padding，避免內容被底部導航或鍵盤完全遮蓋

## 驗收

- 手機輸入框聚焦時，鍵盤彈起後底部導航可操作（scroll 可見）
- 登入頁、表單頁輸入時輸入框可見
