# P2-344：用戶上傳內容安全

`POST /api/upload` 已實作下列防護，供審計與擴充參考。

## 已實作

- **白名單 MIME**：僅允許 `image/jpeg`、`image/png`、`image/webp`，其餘 400。
- **大小限制**：單檔 5MB，超過 400。
- **隨機檔名**：`randomUUID() + .jpg|.png|.webp`，避免路徑遍歷與覆蓋。
- **Supabase Storage**：傳入 `contentType`、`upsert: false`，不執行覆寫。
- **錯誤模糊化**：失敗回傳通用訊息，不洩漏內部路徑或 bucket 名。

## 建議（未來若擴充）

- **獨立域名**：用戶可預覽的圖片使用獨立子域（如 `cdn.cheersin.app`），與主站 cookie 隔離，降低 XSS 影響。
- **掃毒/內容檢查**：若允許 UGC 頭像，可對上傳檔做病毒掃描或影像內容檢查。
- **回應頭**：若改為直接回傳二進位檔，加上 `X-Content-Type-Options: nosniff`、`Content-Disposition: inline`。

## 測試

- 單元測試見 `src/__tests__/api/upload-validation.test.ts`（若已新增）。
- 手動：送非白名單 type、>5MB、缺少 `file` 欄位，預期皆為 4xx。
