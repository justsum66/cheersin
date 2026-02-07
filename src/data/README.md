# Data 與酒款（WINE_TAIWAN #30）

## 台灣酒款資料

- **taiwan-wines.json**：品牌與酒款清單，結構見 `lib/taiwan-wines.ts` 型別 `Bottle`、`Brand`、`TaiwanWinesData`。
- **必填**：`Brand.id`、`name`、`category`、`bottles[]`；`Bottle.name`、`type`；可選 `priceRange`、`region`、`description`。
- **熱賣清單**：`getTaiwanWinesHotBottles({ category?, limit? })` 攤平酒款、依品名排序，供列表/推薦用。

## 推薦 API

- **POST /api/recommend**：接受 `vector`（number[]）或 `soul_wine` / `soul_wine_type` / `quiz_tags` / `recentChat`，回傳 Pinecone 相似酒款。限流 30/分/IP。
- 測驗維度與酒款屬性由 embedding 與 Pinecone namespace `wines` 對齊；詳見 `lib/embedding.ts`、`lib/pinecone.ts`。
