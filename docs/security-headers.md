# P2-364 / P2-331：安全頭與 X-Frame-Options

本專案已實作下列安全頭（含 `next.config` 與 `vercel.json`）：

- **X-Content-Type-Options: nosniff** — 禁止 MIME 嗅探
- **X-Frame-Options** — 防止被嵌入 iframe（點擊劫持）
- **Strict-Transport-Security (HSTS)** — 強制 HTTPS（生產環境）
- **Referrer-Policy** — 控制 referrer 外洩
- **Permissions-Policy** — 限制瀏覽器功能（如相機、麥克風）

部署於 Vercel 時，HTTPS 由平台強制；自建環境請在反向代理（如 Nginx）設定 HSTS。
