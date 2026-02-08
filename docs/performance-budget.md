# P2-278：Performance Budget 說明

建議的效能預算（可納入 CI 或手動檢查）：

| 指標 | 目標 | 說明 |
|------|------|------|
| First Load JS (shared) | < 400 KB | 首屏共用 chunk |
| LCP | < 2.5s | 最大內容繪製 |
| FID / INP | < 100ms | 輸入延遲 |
| CLS | < 0.1 | 累積版面位移 |

**檢查方式**：
- `ANALYZE=true npm run build` 檢視 bundle 體積
- Lighthouse CI 或 Vercel Analytics 監控 Core Web Vitals
- 在 `.github/workflows/perf.yml` 中可加入 Lighthouse 閾值（選配）
