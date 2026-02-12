# 酒類資料

- **wine-knowledge/**：葡萄酒、威士忌、清酒、啤酒入門 Markdown，供 Pinecone 知識庫向量化（`npm run seed:pinecone`）。
- **wines.json**：酒款資料庫，每筆含 `id, name, type, region, country, description, tags`。目標 1000+ 筆可依此格式擴充；擴充後重新執行 `npm run seed:pinecone` 更新向量。
- **wines.schema.json**：酒款 JSON schema 參考。

## RAG 流程（Pinecone 知識庫）

- **流程**：用戶訊息 → embedding（lib/embedding）→ `queryVectors`（lib/pinecone）→ 依 namespace 查詢 → 回傳相似片段與 metadata（source、course_id、chapter）→ 注入侍酒師 context，並在 UI 顯示引用來源。
- **Namespace**：預設 `knowledge`；可設 env `RAG_NAMESPACE`。酒款可另用 `wines` namespace（/api/recommend 等）。
- **維度**：與 embedding 模型一致（見 lib/embedding）。
- **更新**：`npm run seed:pinecone` 寫入課程/酒款向量；後台「知識庫管理」（/admin/knowledge）新增/編輯/刪除會同步寫入或刪除 Pinecone 對應向量。
