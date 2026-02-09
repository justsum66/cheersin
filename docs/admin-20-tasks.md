# Admin 後台 20 項優化任務

目標：管理後台（用戶、知識庫、API 使用）可維護、安全、好用。

| # | 任務 | 狀態 |
|---|------|------|
| 1 | 用戶頁：分頁（limit/offset 或 cursor） | 待實作 |
| 2 | 用戶頁：搜尋防抖（300ms） | ✅ |
| 3 | 用戶頁：空狀態與錯誤狀態文案 i18n | 待實作 |
| 4 | 用戶頁：訂閱列表排序可點擊表頭 | ✅ 已有 |
| 5 | 知識庫頁：列表分頁 | 待實作 |
| 6 | 知識庫頁：關鍵字搜尋 | ✅ 前端篩選 title/course_id/chapter |
| 7 | 知識庫頁：新增/編輯表單驗證 | 待實作 |
| 8 | API 使用頁：日期區間篩選 | 待實作 |
| 9 | API 使用頁：匯出 CSV | ✅ |
| 10 | 全域：admin 路由 middleware 驗證 x-admin-secret | 待實作 |
| 11 | 全域：RLS 或 API 僅 service_role / admin 可讀 | 待實作 |
| 12 | 全域：載入中骨架屏（Skeleton） | ✅ AdminSkeleton 用於用戶/知識庫/使用頁 |
| 13 | 全域：無權限時 403 頁面 | ✅ AdminForbidden 元件，API 401/403 時顯示 |
| 14 | 側邊導航：當前頁 aria-current | ✅ 已有 |
| 15 | 側邊導航：i18n 標籤 | 待實作 |
| 16 | 用戶頁：更新 tier 後樂觀更新 UI | ✅ 已有 |
| 17 | 知識庫頁：刪除前確認對話框 | ✅ 已有 confirm() |
| 18 | API 使用頁：圖表（可選 Recharts） | 待實作 |
| 19 | 稽核日誌：訂閱變更記錄查詢入口（可選） | 待實作 |
| 20 | E2E：admin 登入與搜尋用戶關鍵路徑 | 待實作 |

完成即打勾並更新本文件。

---

**Build 警告修復（2026-02）：** `next.config.ts` 內 webpack cache 的 `buildDependencies.config` 改為使用 `path.join(process.cwd(), 'next.config.ts')`，避免解析不存在的 `next.config.compiled.js`。
