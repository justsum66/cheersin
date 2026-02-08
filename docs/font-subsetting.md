# P2-244：字體子集化 (Font Subsetting)

中文字體體積大，建議僅載入實際使用字元以節省頻寬。

- **目前**：`layout.tsx` 使用 `next/font/google` 的 `Inter`、`Noto_Sans_TC`、`Playfair_Display`，Next 會自動優化並子集化拉丁字元。
- **進階**：若需更激進的中文子集化，可考慮：
  1. 使用 `next/font/local` 載入自建子集字體（如僅含常用 3000 字）。
  2. 或使用 Google Fonts 的 `display=swap` 與 `preload` 已設定，減少 FOIT。
- **參考**：<https://nextjs.org/docs/app/building-your-application/optimizing/fonts>
