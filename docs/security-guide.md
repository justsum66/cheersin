# P2-370：安全意識與實務指南

供團隊與未來維護者參考的 Web 安全要點。

- **輸入驗證**：所有 API 請求體與查參用 Zod 等驗證；勿信任 client。
- **輸出編碼**：用戶生成內容輸出前須 escape 或使用 `sanitizeHtml`，防 XSS。
- **重定向**：僅允許站內路徑或白名單 host，防 Open Redirect。
- **敏感資料**：密碼、Token、API Key 不寫入日誌；日誌使用 `maskSensitiveContext`。
- **依賴**：定期 `npm audit`，高風險漏洞優先修補。
- **Cookie**：HttpOnly、Secure、SameSite=Strict；Session 由 Supabase 管理。
- **HTTPS**：生產環境強制；Vercel 預設處理。
