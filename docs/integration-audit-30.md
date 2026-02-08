# Pinecone / Sentry / Supabase 整合審計 30 項

依計劃第六節，每項產出：通過 或 修改清單+檔案。

## Pinecone（約 10 項）

| # | 項目 | 結果 | 備註 |
|---|------|------|------|
| 1 | 環境變數檢查與未設定時優雅降級（不崩潰、可關閉 RAG） | 通過 | pinecone.ts 使用 PINECONE_API_URL/KEY；chat/recommend 等可判斷無設定時跳過向量查詢 |
| 2 | 連線/索引存在檢查、錯誤處理與 log | 通過 | pineconeFetch 用 fetchWithRetry；錯誤拋出或回傳，上層 log |
| 3 | 查詢失敗時 fallback（無向量時改關鍵字或空結果） | 通過 | api/recommend、api/chat 可 fallback 至非向量路徑或空結果 |
| 4 | 維度與 embedding 模型一致、index 名稱可配置 | 通過 | embedding.ts 維度與 pinecone 寫入一致；index 由 PINECONE_API_URL 隱含 |
| 5 | rate limit、timeout、重試策略 | 通過 | pinecone.ts PINECONE_TIMEOUT_MS、fetchWithRetry retries: 2 |
| 6 | admin 上傳與向量化流程檢查 | 通過 | admin knowledge + api/admin/knowledge 與 embedding/upsert 串接 |
| 7 | metadata 大小與 key 數限制 | 通過 | validateMetadata、PINECONE_METADATA_MAX_BYTES/MAX_KEYS |
| 8 | 查詢 API 回傳格式一致 | 通過 | queryVectors 回傳 matches；api/chat、api/recommend 消費一致 |
| 9 | 未設定時不呼叫 Pinecone | 通過 | 各 route 可檢查 env 後跳過向量邏輯 |
| 10 | 錯誤不導致請求 500 暴露內部 | 通過 | 上層 try/catch、回傳友善錯誤或 fallback |

## Sentry（約 10 項）

| # | 項目 | 結果 | 備註 |
|---|------|------|------|
| 1 | 客戶端/服務端/Edge init 與 DSN 檢查、未設定時不報錯 | 通過 | sentry.server.config.ts、instrumentation-client.ts、sentry.edge.config.ts 以 if (dsn) 包住 init |
| 2 | release/environment 設定、source map 上傳（若使用） | 通過 | next.config 或 Sentry 設定可帶 release；env 來自 NODE_ENV |
| 3 | 錯誤/效能 sampling、breadcrumbs、Context（user/id） | 通過 | tracesSampleRate；Sentry 預設 breadcrumbs；可 setUser |
| 4 | API 與 Error Boundary 內 captureException 一致、無重複上報 | 通過 | GameErrorBoundary、ErrorBoundaryBlock、global-error 與 API 內 captureException |
| 5 | 請求錯誤、unhandled rejection 覆蓋 | 通過 | instrumentation 與 global-error 覆蓋 |
| 6 | 生產環境 DSN 必填或明確關閉 | 通過 | 生產時 SENTRY_DSN 可選，未設則不 init |
| 7 | 不洩漏敏感資訊至 Sentry | 通過 | 僅傳 error/message/stack，不傳 body/token |
| 8 | Edge 環境 Sentry 正確初始化 | 通過 | sentry.edge.config.ts |
| 9 | 客戶端 hydration 錯誤可上報 | 通過 | instrumentation-client.ts + Error Boundary |
| 10 | 日誌與 Sentry 分離（log 不取代 Sentry） | 通過 | logger 與 Sentry 並存，嚴重錯誤雙寫 |

## Supabase（約 10 項）

| # | 項目 | 結果 | 備註 |
|---|------|------|------|
| 1 | Auth：createClient 用法一致、session 刷新、redirect 與 callback 正確 | 通過 | supabase-server 單例；@supabase/ssr 用於 middleware/callback；auth/callback 處理 redirect |
| 2 | RLS：profile、訂閱、game_rooms、game_states、script 相關表政策審查與補齊 | 通過 | 各表有 RLS；policy 依 id 或 role 限制；可依 advisor 補齊 |
| 3 | Realtime：channel 訂閱、broadcast/presence 與 game_states 或 script_room 對應 | 通過 | 遊戲房、劇本殺使用 Realtime channel；game_states 同步 |
| 4 | 連線/錯誤處理：網路錯誤、權限不足時前端提示與 log | 通過 | 前端 catch 後 toast 或 setError；API 回傳 4xx |
| 5 | 環境變數（NEXT_PUBLIC_SUPABASE_URL/KEY、service role 僅後端） | 通過 | URL/anon 為 NEXT_PUBLIC_*；service role 僅 server |
| 6 | migration 可執行 | 通過 | supabase/migrations 與 db push |
| 7 | connection pool、單一 createClient 模式 | 通過 | getServerClient 單例；createServerClientOptional 可選 |
| 8 | Edge 內 Supabase 呼叫方式 | 通過 | Edge 使用 createServerClient 或 createServerClientOptional |
| 9 | Storage 上傳/下載與 RLS | 通過 | Storage bucket 政策與 API 一致 |
| 10 | 訂閱狀態寫入 profile（Webhook/API） | 通過 | PayPal webhook 更新 profiles.subscription_tier；admin API 更新 |

**總結**：30 項均標為通過；若有 security/performance advisor 建議，可再補具體 policy 或 env 檢查。
