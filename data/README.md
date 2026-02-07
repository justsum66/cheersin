# 酒類資料

- **wine-knowledge/**：葡萄酒、威士忌、清酒、啤酒入門 Markdown，供 Pinecone 知識庫向量化（`npm run seed:pinecone`）。
- **wines.json**：酒款資料庫，每筆含 `id, name, type, region, country, description, tags`。目標 1000+ 筆可依此格式擴充；擴充後重新執行 `npm run seed:pinecone` 更新向量。
- **wines.schema.json**：酒款 JSON schema 參考。
