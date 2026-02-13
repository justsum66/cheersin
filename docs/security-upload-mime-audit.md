# SEC-012：上傳白名單 MIME 審計

## 摘要

POST /api/upload 已實作 MIME 白名單與大小限制，符合 SEC-012 要求。

## 實作位置

- `src/app/api/upload/route.ts`

## 白名單與限制

| 項目 | 值 | 備註 |
|------|-----|------|
| 允許 MIME | `image/jpeg`, `image/png`, `image/webp` | 禁止 executable、任意類型 |
| 單檔上限 | 5 MB | `MAX_BYTES = 5 * 1024 * 1024` |
| 檔名 | UUID + 副檔名 | 防路徑遍歷、惡意檔名 |
| 限流 | upload 專用限流 | SEC-001 已覆蓋 |

## 驗證邏輯

1. `file.type?.toLowerCase()` 必須在 `ALLOWED_TYPES` 內，否則 400
2. `blob.size <= MAX_BYTES`，否則 400
3. 副檔名由 MIME 推導：jpeg→jpg, png→png, webp→webp
4. Storage 使用 `contentType: type` 確保存入正確 MIME

## 勾選摘要

- [x] 白名單 MIME 強制
- [x] 大小限制強制
- [x] 隨機檔名
- [x] 無執行檔類型

**更新日期**：2026-02-12
