# AI 酒款推薦系統（P2/P3）

- **API**：`POST /api/recommend`（限流 30/分/IP）。  
- **輸入**：`vector`（number[]）或 `soul_wine` / `soul_wine_type` / `quiz_tags` / `recentChat`；可選 `namespace`（`wines` | `knowledge`）、`topK`（1–20）。  
- **邏輯**：未提供 vector 時以 soul_wine + recentChat 等文字經 `getEmbedding()` 取得向量，再以 Pinecone `queryVectors` 查相似酒款。  
- **前端入口**：助理頁（Chat）依靈魂酒測結果與對話歷史呼叫推薦；遊戲大廳「猜你喜歡」區塊為規則推薦；學習頁「下一步課程」為路徑推薦。  
- **未設定 Pinecone 時**：API 回 503，前端可隱藏「AI 推薦」區塊或提示稍後再試。
