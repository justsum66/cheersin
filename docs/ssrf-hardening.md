# SSRF（服務端請求偽造）防護與端點白名單

## 現狀

- **next.config.ts**：`images.remotePatterns` 已白名單化（Supabase、DiceBear、QR、Google 頭像），僅允許指定 host 的圖片載入，降低透過 `next/image` 觸發的 SSRF 風險。
- **API 端點**：目前對外 `fetch` 僅指向固定 URL（PayPal、Resend 等），**無**接受使用者輸入 URL 再代為請求的 proxy 端點，因此現有 API 無 SSRF 漏洞。

## 未來若新增「依 URL 拉取資源」類 API

1. **禁止依使用者輸入 URL 直接 fetch**：若必須實作「預覽連結」「縮圖代抓」等，應：
   - 僅允許 **https**
   - 使用 **固定白名單 host**（如 `allowedHosts: ['cdn.example.com']`）
   - 禁止內網與 metadata 位址（如 `169.254.169.254`、`localhost`、`127.0.0.1`、`::1`、私有網段）
2. **設定連線逾時與大小上限**：避免長時間或大體積回應拖垮服務。
3. **記錄審計**：對此類請求記錄目標 host、結果狀態，便於事後審查。

本文件作為 SSRF 防護與端點白名單的設計依據，新增任何「依 URL 請求」功能前請依此審查。
