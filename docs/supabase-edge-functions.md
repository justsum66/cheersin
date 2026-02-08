# P2-306：Supabase Edge Functions（可選）

對需要低延遲的 API（如遊戲狀態同步、即時計分），可評估使用 Supabase Edge Functions 取代部分 Vercel Serverless。

## 優點

- 與 Supabase Realtime / DB 同區域，延遲低
- Deno 運行時，冷啟動較快
- 可直接呼叫 Supabase 客戶端

## 限制

- 需維護 Deno 語法與依賴（與 Next.js Node 不同）
- 複雜業務邏輯若已寫在 Next.js API，遷移成本高

## 適用場景

- 輕量 Webhook 處理（如支付回調轉發）
- 高頻小 payload 的狀態同步（如「誰在線」心跳）

## 當前狀態

現有遊戲房與 Realtime 仍以 Next.js API + Supabase Client 為主；若未來有明確延遲瓶頸再評估單一路由遷至 Edge。
