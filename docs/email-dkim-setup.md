# Email 與 DKIM 設定（Resend）

本專案使用 [Resend](https://resend.com) 發送交易郵件（訂閱到期提醒、扣款失敗通知等）。DKIM 簽章由 **Resend 後台 + 網域 DNS** 設定，應用程式端無需實作簽章程式碼。

## 為何需要 DKIM

- 提高送達率：收件方（Gmail、Outlook 等）可驗證郵件確實來自你的網域。
- 降低被標記為垃圾信或拒收的機率。

## 設定步驟

### 1. 在 Resend 新增並驗證網域

1. 登入 [Resend Dashboard](https://resend.com/domains)。
2. 點擊 **Add Domain**，輸入你的發信網域（例如 `cheersin.app` 或子網域 `mail.cheersin.app`）。
3. Resend 會顯示需要新增的 **DNS 記錄**（包含 DKIM 用的 CNAME 或 TXT）。

### 2. 新增 DKIM DNS 記錄

在您的 DNS 供應商（Cloudflare、Vercel、AWS Route 53 等）新增 Resend 提供的記錄：

- **類型**：多為 CNAME 或 TXT。
- **名稱**：Resend 會給（例如 `resend._domainkey` 或類似）。
- **內容 / 目標**：從 Resend 複製貼上。

儲存後等待 DNS 傳播（通常數分鐘至數小時）。

### 3. 在 Resend 驗證網域

回到 Resend Dashboard，對該網域點擊 **Verify**。若 DKIM（及 SPF 等）記錄正確，狀態會變為已驗證。

### 4. 使用已驗證網域發信

在專案中設定環境變數：

- `RESEND_FROM_EMAIL`：寄件者地址須使用**已驗證網域**，例如 `Cheersin <noreply@cheersin.app>`。
- 使用 `onboarding@resend.dev` 僅供測試，**不會**帶 DKIM；正式環境請改用自有網域。

驗證完成後，經由 Resend API 送出的郵件會由 Resend 自動加上 DKIM 簽章，無需在程式碼中處理。

## 相關檔案

- 發信邏輯：`src/lib/subscription-lifecycle.ts`（到期提醒）
- PayPal 扣款失敗通知：`src/app/api/webhooks/paypal/route.ts`
- 環境變數範例：`.env.example`（Resend 區段）

## 參考

- [Resend – Verify your domain](https://resend.com/docs/dashboard/domains/verify-domain)
- [Resend – DKIM](https://resend.com/docs/dashboard/domains/dkim)
