# P2-355：數據加密 (At Rest)

Supabase（PostgreSQL）預設支援傳輸加密（TLS）；靜態儲存依方案而異。

- **Supabase**：資料庫層由供應商管理；可於 Dashboard → Project Settings → Database 確認「Disk Encryption」等選項（依方案提供）。
- **敏感欄位**：若需應用層加密，可對特定欄位使用 AES 等加密後再寫入；金鑰由環境變數管理，不寫入版控。
