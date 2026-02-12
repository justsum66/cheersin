# Supabase 30 項優化任務

RLS、索引、遷移、錯誤處理、型別、效能、安全。

## 任務清單

| # | 狀態 | 說明 |
|---|------|------|
| SB-01 | ☑ | 審計所有 public 表 RLS 政策（參考 docs/rls-policies-audit.md）；已建 rls-policies-audit.md |
| SB-02 | ☑ | profiles 表 RLS：select/update 僅本人或 service role（已滿足） |
| SB-03 | ☑ | subscription_audit 僅 service role；webhook_events 若存在則僅 service role（本專案目前無 webhook_events 表） |
| SB-04 | ☐ | chat/learn/upload 相關表 RLS 補齊 |
| SB-05 | ☑ | 外鍵與常用查詢欄位已有 index；重複索引 P15 已處理（DROP idx_profiles_subscription） |
| SB-06 | ☐ | 遷移檔命名與時序統一（可選 Supabase CLI 或手動 SQL） |
| SB-07 | ☐ | getCurrentUser 單次請求或短期快取（避免同一 request 多次呼叫） |
| SB-08 | ☐ | API 錯誤統一轉成 AppError 或 4xx/5xx；Supabase 錯誤不洩漏內部資訊 |
| SB-09 | ☐ | 型別由 DB 生成並匯入（supabase gen types）；api-bodies 對齊 |
| SB-10 | ☐ | 連線逾時與重試（可選：createClient 選項或 fetch 重試） |
| SB-11 | ☐ | 敏感欄位不寫入 log（email、token 等） |
| SB-12 | ☐ | subscription_audit 表結構與保留策略（如 90 天後歸檔或刪除） |
| SB-13 | ☐ | webhook_events 表結構與清理策略（冪等用、過期刪除） |
| SB-14 | ☐ | chat-history-persist 與 RLS（僅本人可讀寫自己的紀錄） |
| SB-15 | ☐ | upload 桶政策：大小限制、類型限制、僅登入用戶可上傳 |
| SB-16 | ☐ | cron 或 edge 使用 service role 時權限最小化、僅必要表 |
| SB-17 | ☑ | 文件列出所有使用 Supabase 的 API 與表、用途；見 docs/supabase-api-table-matrix.md |
| SB-18 | ☐ | auth 相關表（若有自建）RLS 與索引 |
| SB-19 | ☑ | 遊戲房間/state 表 RLS：已收緊（rls_game_states_tighten） |
| SB-20 | ☐ | 腳本/劇本表 RLS：公開讀、寫需權限或 admin |
| SB-21 | ☐ | 學習進度/證書表 RLS：僅本人可讀寫 |
| SB-22 | ☐ | 錯誤訊息不包含 raw Postgres 錯誤（使用者可見文案 i18n） |
| SB-23 | ☑ | createServerClientOptional：env 缺失時已 return null 不拋錯（service role  client 無 cookie 依賴） |
| SB-24 | ☐ | 批量查詢優化（避免 N+1）；必要時 .select() 限制欄位 |
| SB-25 | ☐ | 若使用 Realtime：channel 訂閱與 unsubscribe 成對、錯誤處理 |
| SB-26 | ☐ | 環境變數 SUPABASE_URL、SUPABASE_ANON_KEY 校驗與文件 |
| SB-27 | ☐ | 遷移前備份或可還原策略（文件說明） |
| SB-28 | ☐ | 開發/測試用 seed 或 fixture（可選） |
| SB-29 | ☐ | RLS 政策單元測試或手動檢查清單 |
| SB-30 | ☑ | Supabase Advisors 安全/效能建議處理（get_advisors 後修復）；已建 docs/supabase-advisors-fixes.md，本批完成 auth_rls_initplan、game_states RLS、wine_favorites 合併 |
