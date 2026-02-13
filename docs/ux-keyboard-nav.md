# UX-004：手機底部導航不被鍵盤完全遮擋

## 實作

- **Navigation.tsx**：`focusin` 監聽 input/textarea/select；手機 (<768px) 時延遲 400ms 後 `bottomNavRef.scrollIntoView({ block: 'end', behavior: 'smooth' })`，確保鍵盤彈起後底部導航仍可 scroll 進入視野
- **登入頁**：email/password 輸入框 `onFocus` 時 `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`，減少鍵盤遮擋
- **main**：`main-content-pb` 提供 5rem + safe-area 底部 padding，避免內容被底部導航或鍵盤完全遮蓋

## 驗收

- 手機輸入框聚焦時，鍵盤彈起後底部導航可操作（scroll 可見）
- 登入頁、表單頁輸入時輸入框可見
