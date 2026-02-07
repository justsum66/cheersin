# Windows 開發環境說明

## 建議指令

- **日常開發**：`npm run dev`（預設使用 Turbopack 加速 HMR）
- **若 Turbopack 出錯**：改用 `npm run dev:webpack`（webpack 較穩定，避免 postcss.js / ENOENT）
- **不清快取直接啟動**：`npm run dev:raw`

## 若出現 Turbopack FATAL / postcss.js / ENOENT

1. 關閉 dev server，執行 **`npm run clean`**
2. 使用 **`npm run dev:webpack`**（不用 Turbopack）較穩定
3. **`_buildManifest.js.tmp.*` ENOENT**：Turbopack 暫存檔競態，先 `npm run clean` 再 `npm run dev:webpack`

## 已做的修復

- **單一 Next 設定**：僅使用 `next.config.ts`（已移除 `next.config.js`），避免雙設定導致 chunk ID 錯亂與 `/_app` undefined
- **Next.js 15.5.7**：與 `@next/swc-win32-x64-msvc@15.5.7` 一致，避免 15.5.11 下載 404 與 lockfile 修補失敗
- **optionalDependencies**：顯式安裝 `@next/swc-win32-x64-msvc@15.5.7`，避免「lockfile missing swc dependencies」
- **Watchpack**：忽略 `C:\hiberfil.sys`、`pagefile.sys`、`swapfile.sys`、`DumpStack.log.tmp` 等系統檔，避免 EINVAL
- **Webpack cache**：dev 使用 `memory` cache，避免 `.next/cache/webpack/*.pack.gz` ENOENT
- **moduleIds**：`optimization.moduleIds = 'deterministic'`，減少 chunk 編號錯亂

## 請勿在 Windows 上使用

- `npm run dev:turbo`（Turbopack 在 Windows 上易出現 chunk 錯亂）

## 若仍有錯誤

**出現 `Cannot read properties of undefined (reading 'call')`、`Cannot find module './4586.js'`、`motion-dom.js`、`vendor-chunks/next.js`、`prerender-manifest.json ENOENT` 或 `SegmentViewNode`：**

1. **若剛執行 `taskkill /F /IM node.exe`**：務必先 clean + build，勿直接 `npm run dev`
2. 關閉所有 dev server（關掉所有跑 `next dev` 的終端）
3. 執行 **`npm run dev:safe`**（clean + build + dev）— 最穩定，會先建置產生 manifest
4. 若無法用 dev:safe，則依序：**`npm run clean`** → **`npm run build`** → **`npm run dev`**
5. 僅 `dev:clean`（clean + dev）不足以修復，需先有 build

一般步驟：

1. 關閉所有 dev server
2. `npm run clean` 或手動刪除 `.next` 資料夾
3. `npm run build` 重新產生 `routes-manifest.json` 與 chunk（若出現 `ENOENT: routes-manifest.json` 或 `Cannot find module './xxx.js'` 必做）
4. `npm run dev` 或 `npm run dev:safe`（clean + build + dev）

若曾出現 `Invalid Version`：刪除 `package-lock.json` 後再 `npm install`

## 安全說明

Next.js 15.5.7 有安全公告（見 npm 警告）。目前鎖定 15.5.7 是為了與 Windows 上可用的 `@next/swc-win32-x64-msvc` 一致。待官方釋出修補版且 npm 上提供對應 SWC 後，可再升級。
