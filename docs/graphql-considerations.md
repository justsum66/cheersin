# P2-293：GraphQL 聚合層（可選）考量

若 API 數量成長後需減少 over-fetching/under-fetching，可評估引入 GraphQL（如 Apollo Server）聚合現有 REST。當前以 REST + OpenAPI 為主，本文件記錄未來選型要點。

- **適用情境**：多端（Web/App/合作夥伴）需不同欄位組合、複雜巢狀查詢時。
- **實作要點**：`app/api/graphql/route.ts`、resolver 委派至既有 service/DB，避免重複邏輯。
- **狀態**：文檔已建立；實際引入待 API 規模與需求明確後再評估。
