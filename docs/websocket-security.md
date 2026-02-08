# P2-372：WebSocket 安全 (WSS)

Supabase Realtime 使用 WebSocket。

- **WSS**：生產環境應使用 `wss://`（TLS）；Supabase 客戶端連線 URL 為 `https://` 時，Realtime 會使用 WSS。
- **身份**：連線會帶入 Supabase JWT；RLS 與 channel 權限由後端控制，確保僅授權用戶可訂閱/廣播。
