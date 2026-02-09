# 全站品牌 Logo 系統部署 — 完成驗證（路徑修正版）

依 `Cursor 指令 v2：全站品牌 Logo 系統部署（路徑修正版）.md` 逐項確認。

## 任務完成狀態

| 任務 | 狀態 | 備註 |
|------|------|------|
| 1. BrandLogo.tsx：LOGO_SRC、LOGO_ICON_SRC、BRAND_TAGLINE、導出 | ✅ | 已為 logo_monochrome_gold.png、沁飲 Sensory Lab、LOGO_ICON_SRC |
| 2. layout.tsx：metadata.icons、shortcut、preload link | ✅ | favicon_16/32、apple_touch_180、shortcut favicon.ico、preload logo_monochrome_gold.png |
| 3. manifest.ts：icons、screenshots、name、short_name | ✅ | android_192/512、favicon、icon_256/512_gold、og_image_1200x630、沁飲 |
| 4. assistant/page.tsx：AI 頭像 3 處 | ✅ | 已為 /sizes/icon_128_gold.png |
| 5. opengraph-image.tsx：主站 + 各子頁 | ✅ | 主站讀取 og_image_1200x630.png；子頁含「沁飲 Cheersin」文案 |
| 6. public/sw.js：STATIC_URLS | ✅ | logo_monochrome_gold、sizes/favicon_16/32、android_192/512 |
| 7. games/layout、learn/certificate/layout：images url | ✅ | /sizes/icon_512_gold.png |
| 8. 全域掃描：無 "/logo.png"、舊 favicon、舊 icons 引用 | ✅ | 僅指令 doc 與 generate-icons 腳本內為說明/輸出檔名 |

## 驗證清單

- [x] 導航欄 Logo 為金色 Logo + 「沁飲 Sensory Lab」tagline
- [x] AI 侍酒師頭像為金色小圖標
- [x] PWA manifest 為新圖標與沁飲名稱
- [x] 主站 OG 使用 public/sizes/og_image_1200x630.png
- [x] Service Worker 快取新路徑
- [x] 應用程式碼中無 "/logo.png" 引用
