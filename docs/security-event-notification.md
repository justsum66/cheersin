# P2-350：安全事件通知

當用戶賬戶發生安全相關事件時，通過郵件通知用戶，讓用戶及時發現異常活動。

## 事件類型

- **新設備登入**：從未見過的 IP / User-Agent 登入時發送「您的帳號剛在 XXX 登入」
- **密碼修改**：用戶透過「重設密碼」完成修改後發送確認
- **重要設定變更**（可選）：如綁定/解綁 2FA、變更主要信箱

## 實作要點

1. **觸發點**
   - 登入成功：`/auth/callback` 或登入成功後呼叫 `POST /api/auth/notify-security`（body: `{ event: 'login', email? }`），後端比對本次 IP/UA 與上次，若異動則發信。
   - 密碼重設成功：在 `/auth/reset-password` 完成 set password 後呼叫 `{ event: 'password_change' }`。

2. **發信**
   - 使用 Resend、SendGrid 或 Supabase Auth 內建模板（若支援）。
   - 環境變數範例：`RESEND_API_KEY`、`SECURITY_EMAIL_FROM`。
   - 未設定時僅寫入日誌，不阻擋流程。

3. **內容**
   - 含時間、裝置/IP（可選）、「若非本人請立即修改密碼」與連絡方式。
   - 避免在信中放置可被濫用的連結（重設密碼連結僅在用戶主動請求時發送）。

## 相關檔案

- `api/auth/notify-security/route.ts`（可選）：接收 event，記錄並觸發發信。
- `auth/callback`、`auth/reset-password`：登入/重設成功後呼叫 notify-security。
