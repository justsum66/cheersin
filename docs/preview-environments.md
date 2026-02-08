# P3-466：預覽環境 (Preview Environments)

- **目標**：每個 PR 自動建立預覽環境（Vercel Preview + 可選獨立 DB）。
- **Vercel**：PR 會自動產生 preview URL；可於 `vercel.json` 或專案設定綁定預覽用環境變數。
- **獨立 DB**：可選 Supabase Branching 或預覽用 project；需在 CI 或 Vercel 中注入預覽專案 URL。
- **狀態**：文檔已建立；Vercel 預覽已內建，獨立 DB 依需求再配置。
