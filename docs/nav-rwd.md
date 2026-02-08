# 導航 RWD 策略（NAV 響應式）

- **斷點**：`md: 768px` 為桌面/手機切換點（與 `docs/rwd-breakpoints.md` 一致）。
- **桌面 (≥768px)**：頂部橫條顯示全部連結（首頁、測驗、遊戲、助理、學院）、訂閱狀態、通知、用戶選單；字體大小控制 `sm:flex` 顯示。
- **手機 (<768px)**：頂部僅品牌 + 主題/對比/漢堡按鈕；**底部固定導航**（5 個 NAV_ITEMS + icon + 文案），`safe-area-pb` 避開 home indicator；漢堡開啟全屏 overlay 選單，順序與桌面一致。
- **Safe area**：頂部 nav 使用 `safe-area-pt` 避開 notch/動態島；底部 nav 使用 `safe-area-pb`（見 `globals.css`）。
- **觸控**：可點擊元素 `min-h-[48px]` 或 `games-touch-target`，滿足 44pt 最小觸控目標（`constants/nav.ts` MIN_TOUCH_TARGET_PX）。
- **無障礙**：`aria-current="page"`、`aria-expanded`、`aria-controls`、焦點陷阱（useFocusTrap）、Escape 關閉選單。
