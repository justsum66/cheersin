# P2-344：用戶上傳內容安全

**實作位置：** `src/app/api/upload/route.ts`

## 已實作項目

- **白名單類型：** 僅允許 `image/jpeg`、`image/png`、`image/webp`，拒絕其他 MIME。
- **大小限制：** 單檔最大 5MB（`MAX_BYTES = 5 * 1024 * 1024`）。
- **隨機檔名：** 使用 `crypto.randomUUID()` + 副檔名，避免路徑遍歷與覆蓋。
- **儲存：** Supabase Storage bucket `uploads`，不執行用戶上傳的程式碼。
- **回應頭：** 成功/錯誤皆帶 `X-Content-Type-Options: nosniff`。

## 建議（未來若支援頭像等）

- 使用獨立域名提供用戶上傳資源（例如 `cdn.cheersin.com`），與主站分離。
- 可選：後端圖片轉碼/縮圖，統一格式與尺寸，降低惡意檔風險。
