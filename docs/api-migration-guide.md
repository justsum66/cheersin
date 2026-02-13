# DEV-013：API 變更遷移說明

## 目的

重大 API 變更時，於此記錄遷移步驟與相容性說明，供前端與協力方參考。

## 格式

每次變更新增一節：

### [日期] 變更摘要

- **影響 API**：路徑或 RPC 名稱
- **變更內容**：新增/移除/修改欄位或行為
- **相容性**：breaking / backward compatible
- **遷移步驟**：客戶端需做何調整

## 範例

### 2026-02-12 初始

- 目前無重大 breaking API 變更；現有 POST/GET 路由保持穩定。
- 未來若有變更，將於此更新並在 CHANGELOG 註記。

## 相關

- OpenAPI spec：`api-docs/openapi.yaml`（若有）
- 型別：`scripts/generate-api-types.mjs` 可從 OpenAPI 生成 `src/types/api-generated.d.ts`
