# P2-330：API 模塊化

大型 route 可拆成 services / repositories 層，便於測試與維護。

- **建議結構**：`app/api/.../route.ts` 僅負責解析請求、呼叫 service、回傳回應；業務邏輯放在 `lib/` 或 `services/`（如 `lib/subscription-lifecycle.ts`）。
- **本專案**：訂閱邏輯已部分抽至 `subscription-lifecycle.ts`；chat 的 fallback、RAG 等可進一步抽成 `lib/chat-service.ts` 等。
- **好處**：單元測試可直接測 service，不需 mock Request；職責單一、易讀。
