# P2-345：雙因素認證 (2FA) 規劃

- **目標**：用戶可綁定 TOTP（如 Google Authenticator），登入時輸入 6 位驗證碼。
- **建議實作**：`profile/security/page.tsx` 啟用/停用 2FA、顯示 QR；後端驗證 TOTP（如 `otplib`）、寫入 `profiles.totp_secret`（加密存儲）。
- **狀態**：規劃文檔；實際開發待排期。
