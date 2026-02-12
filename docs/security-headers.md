# 安全標頭說明（Security Headers）

本專案在 `next.config.ts` 的 `headers()` 中設定全站安全標頭，經由 `source: '/:path*'` 套用至所有頁面與 API 路徑。無需在 middleware 重複加入相同標頭。

## 已實作標頭

| 標頭 | 值 | 說明 |
|------|-----|------|
| **X-Content-Type-Options** | `nosniff` | 禁止 MIME type 嗅探，降低 XSS/驅動下載風險。 |
| **X-Frame-Options** | `SAMEORIGIN` | 僅允許同源嵌入；防止點擊劫持。若需允許被第三方嵌入（例如遊戲 iframe），再於該路徑放寬或改為 `ALLOWALL`。 |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | 控制 Referer 外洩，跨站時僅送 origin。 |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), payment=()` | 停用攝影機、麥克風、定位、Payment Request API。 |
| **Content-Security-Policy** / **Content-Security-Policy-Report-Only** | 見下節 | CSP 防 XSS；依環境變數決定為強制或僅報告。 |
| **Strict-Transport-Security** (HSTS) | `max-age=31536000; includeSubDomains; preload` | 僅在 **production** 送出；強制 HTTPS、含子網域、可提交 preload 清單。 |

## Content-Security-Policy（CSP）與環境變數

- **預設行為**：未設定或 `CSP_REPORT_ONLY` 不為 `false` 時，使用 **Content-Security-Policy-Report-Only**，違規僅上報、不阻擋，方便上線前觀察。
- **正式環境建議**：上線後設 **`CSP_REPORT_ONLY=false`**，改為強制 **Content-Security-Policy**，違規會被瀏覽器阻擋。
- 設定方式：在正式環境的 `.env` / 部署平台環境變數中加入：
  ```bash
  CSP_REPORT_ONLY=false
  ```

CSP 內容包含：`default-src 'self'`、`script-src` / `style-src` / `img-src` / `connect-src` / `frame-src` 白名單、`frame-ancestors 'self'`、`object-src 'none'`、`base-uri 'self'`、`form-action 'self'`。詳細值見 `next.config.ts` 內 `headers()`。

## 可選後續優化

- 逐步縮小 `script-src` / `style-src` 中的 `unsafe-inline`、`unsafe-eval`（需配合 nonce 或 hash，評估開發與建置成本）。
- 若有 CSP 報告接收端，可加上 `report-uri` 或 `report-to` 以集中檢視違規。

## 相關檔案

- 設定位置：`next.config.ts` → `headers()`（約 L126–183）
- 遊戲內嵌註解：`src/app/(app)/games/layout.tsx`（若需允許被嵌入可個別放寬 X-Frame-Options / CSP）
