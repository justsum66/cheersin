# P2-377：RAG（檢索增強生成）流程優化

**相關模組：** `lib/embedding.ts`、`lib/pinecone.ts`、AI 助理檢索流程。

## 現狀

- Embedding 使用 OpenRouter/OpenAI 等模型寫入 Pinecone。
- 檢索為向量相似度搜尋。

## 優化方向

1. **Chunking 策略：** 依段落/標題切分，控制 chunk 大小（如 300–500 tokens），必要時 overlap 避免斷句。
2. **混合搜索：** 關鍵字（BM25/全文） + 向量檢索，合併分數或輪替結果，提升關鍵詞命中。
3. **元資料篩選：** Pinecone metadata 存放 `source`、`type`（酒款/課程/規則），檢索時依情境篩選。
4. **重排序：** 檢索結果可經輕量 re-rank 模型或規則（如關鍵詞加權）再取 top-k。

## 實作優先級

- 短期：在 `lib/embedding.ts` 中統一 chunk 大小常數與 overlap，並在 metadata 寫入 `source`。
- 中期：在 `lib/pinecone.ts` 或 chat 路徑加入關鍵字過濾（若有全文索引）或 metadata filter。
- 長期：引入 re-rank 或混合分數合併。
