# P2-259：Lighthouse CI 說明

可在 CI 中整合 Lighthouse，於每次部署前檢查效能、無障礙與 SEO。

- **方式一**：使用 [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)，在 `.github/workflows/lighthouse.yml` 中於 build 後對預覽 URL 執行 `lhci autorun`，並設定 `assert` 閾值（如 performance >= 0.8）。
- **方式二**：使用 Vercel 的 [Speed Insights](https://vercel.com/docs/speed-insights) 與 [Web Vitals 報表](https://vercel.com/docs/analytics)，無需自建 Lighthouse 腳本。
- **本專案**：已存在 `lighthouse.yml` 占位；可依需求啟用或改為依賴 Vercel Analytics。
