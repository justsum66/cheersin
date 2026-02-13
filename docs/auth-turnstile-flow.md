# SEC-008：Turnstile 驗證流程

## 概述

Cloudflare Turnstile 用於登入、忘記密碼等流程，防止機器人濫用。**驗證失敗時不建立 session**。

## 流程

1. **前端**：使用者完成表單後，先呼叫 Turnstile widget 取得 `token`
2. **驗證 API**：`POST /api/auth/verify-turnstile`，body `{ token: string }`
3. **後端**：向 Cloudflare 驗證 token，回傳 `{ success: boolean }`
4. **前端**：**僅在 `success === true` 時**才呼叫 `signInWithOtp`、`resetPasswordForEmail` 等建立 session 的 API
5. **驗證失敗**：`success: false` 時，前端顯示錯誤，**不呼叫任何會建立 session 的 API**

## 實作位置

- API：`src/app/api/auth/verify-turnstile/route.ts`
- 登入：`src/app/login/page.tsx` — 先 `verify-turnstile`，成功後才 `signInWithOtp`
- 忘記密碼：`src/app/auth/forgot-password/page.tsx` — 同上

## 環境變數

- `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile Secret Key（未設時 API 回傳 `success: true` 以利開發）
