# P2-252：Turbopack 使用說明

專案已支援 Turbopack 作為開發時打包工具，以獲得更快的 HMR 與建置速度。

- **啟用方式**：`npm run dev` 預設使用 `next dev --turbopack`（見 `package.json` 的 `dev` script）。
- **注意**：生產建置仍使用 Webpack（`next build`）。若遇 Turbopack 相容問題，可改用 `npm run dev:webpack`。
- **文件**：<https://nextjs.org/docs/architecture/turbopack>
