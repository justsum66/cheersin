# P2-346：Subresource Integrity (SRI)

對從 CDN 載入的第三方 CSS/JS 加上 `integrity` 可防止被篡改。

- **適用**：若透過 `<script src="https://cdn.example.com/...">` 載入腳本，應加上 `integrity="sha384-..."` 與 `crossorigin="anonymous"`。
- **Next.js**：`next/script` 載入的資源由 Next 控管；若自訂外部 script，可手動計算 hash 並填入。
- **工具**：`openssl dgst -sha384 -binary script.js | openssl base64 -A` 可產生 integrity 值。
