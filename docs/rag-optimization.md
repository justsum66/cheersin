# P2-377：RAG（檢索增強生成）優化建議

當前 Embedding 與檢索流程的優化方向。

## 現狀

- **Embedding**：`lib/embedding.ts` 使用 OpenRouter embedding API，單次最長 8000 字元，逾時 15s、重試 2 次。
- **檢索**：依專案 Pinecone（或類似）向量查詢；chunk 來源為 `scripts/seed-pinecone` 等。

## Chunking 策略建議

- **大小**：單 chunk 建議 300–600 tokens（約 150–300 字），重疊 50–100 tokens，避免語意斷在中間。
- **邊界**：以句號、段落、標題切分，避免從單字或半句切開。
- **元數據**：每個 chunk 寫入 `courseId`、`chapterId`、`title`，檢索後可過濾或加權。

## 檢索優化

- **混合搜索**：向量相似度 + 關鍵字（BM25 或 Supabase full-text），融合分數後排序。
- **重排序**：檢索 top-K（如 20）後，用小型 cross-encoder 或規則（關鍵字命中）重排取 top-5，再送 LLM。
- **過濾**：依 locale、課程、章節篩選，減少無關 chunk。

## 實作優先級

1. 在 `scripts/seed-pinecone`（或對應腳本）中落實 chunk 大小與重疊、邊界規則。
2. 查詢端：若使用 Supabase，可加 `textSearch` 與向量查詢並行，再合併結果。
3. 重排序可為第二階段，先觀察僅向量檢索的答題品質再決定。
