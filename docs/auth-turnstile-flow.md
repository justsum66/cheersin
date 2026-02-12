# Turnstile 驗證流程（SEC-008）

對應 TASKS-170 SEC-008：Turnstile 驗證失敗時不建立 session，登入流程文件化且實作一致。

## 流程概述

1. **前端**（登入頁、忘記密碼頁）：若啟用 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`，使用者須先完成 Turnstile 挑戰並取得 `token`。
2. **前端**在送出登入／重設密碼前，先呼叫 **POST /api/auth/verify-turnstile**，body：`{ token: string }`。
3. **後端**向 Cloudflare 驗證 token，回傳 `{ success: true }` 或 `{ success: false }`（或 400/500）。
4. **僅當 `success === true`** 時，前端才繼續執行：
   - **登入**：呼叫 `supabase.auth.signInWithPassword()`（會建立 session）。
   - **忘記密碼**：呼叫 `supabase.auth.resetPasswordForEmail()`。
5. 若驗證失敗（`success: false` 或 API 錯誤），前端 **return 不繼續**，故 **不會建立 session**，也不會發送重設密碼信。

## 實作對照

| 頁面 | Turnstile 失敗時行為 |
|------|----------------------|
| 登入 `src/app/login/page.tsx` | `verifyData.success` 為 false 時 `return`，不呼叫 `signInWithPassword` |
| 忘記密碼 `src/app/auth/forgot-password/page.tsx` | `verifyData.success` 為 false 時 `return`，不呼叫 `resetPasswordForEmail` |

## API

- **POST /api/auth/verify-turnstile**  
  - Body：`{ token: string }`（SEC-003 已用 Zod 校驗）。  
  - 回傳：`{ success: boolean }`。  
  - 未設定 `TURNSTILE_SECRET_KEY` 時回傳 `{ success: true }`（開發環境可跳過驗證）。

## 相關檔案

- 後端：`src/app/api/auth/verify-turnstile/route.ts`
- 登入：`src/app/login/page.tsx`
- 忘記密碼：`src/app/auth/forgot-password/page.tsx`
