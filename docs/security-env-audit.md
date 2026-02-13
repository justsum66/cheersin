# SEC-010：環境變數與 API Key 審計

## 概述

敏感變數僅供 server 使用，無 `NEXT_PUBLIC_` 暴露 secret。

## 允許的 NEXT_PUBLIC_（可公開）

| 變數 | 用途 |
|------|------|
| NEXT_PUBLIC_APP_URL | OAuth callback、訂閱 return_url、連結 |
| NEXT_PUBLIC_APP_NAME | 品牌、OpenRouter header |
| NEXT_PUBLIC_SUPABASE_URL | Supabase client 連線 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key（設計上可公開，RLS 保護） |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Cloudflare Turnstile 前端驗證 |
| NEXT_PUBLIC_SW_ENABLED | PWA Service Worker 開關 |
| NEXT_PUBLIC_SENTRY_DSN | Sentry 前端錯誤追蹤 |
| NEXT_PUBLIC_GA_ID | Google Analytics |
| NEXT_PUBLIC_SOCIAL_PROOF_COUNT | 社會認證數字 |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | Web Push 公鑰 |
| NEXT_PUBLIC_PROMO_END_MS | 優惠倒數 |

## 嚴禁 NEXT_PUBLIC_ 的 Secret

| 變數 | 使用位置 |
|------|----------|
| SUPABASE_SERVICE_ROLE_KEY | supabase-server、API |
| GROQ_API_KEY | env-config、chat API |
| OPENROUTER_API_KEY | env-config、chat API |
| PINECONE_API_KEY / URL | recommend、health API |
| PAYPAL_CLIENT_SECRET | subscription、webhooks API |
| TURNSTILE_SECRET_KEY | verify-turnstile API |
| RESEND_API_KEY | email |
| UPSTASH_* | rate-limit |
| ADMIN_SECRET | admin routes |
| CRON_SECRET | cron routes |

## 審計結論

- 無 secret 設為 NEXT_PUBLIC_
- `env-config.ts`、API routes 僅在 server 讀取敏感變數
- 客戶端僅透過 NEXT_PUBLIC_* 取得必要公開值
