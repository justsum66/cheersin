# 關閉不必要 NODE 行程（Windows）

開發時若有多個 `node.exe` 或 `next dev` 佔用埠或記憶體，可手動關閉多餘行程。

## 1. 查看目前 node 行程

在 **PowerShell** 或 **CMD** 執行：

```powershell
tasklist /FI "IMAGENAME eq node.exe"
```

會列出所有 `node.exe` 的 PID。

## 2. 關閉「所有」node 行程（慎用）

```powershell
taskkill /F /IM node.exe
```

- 會關閉**所有** node（含正在跑的 dev server、build、測試）。
- 關閉後需重新 `npm run dev` 或 `npm run build`。

## 3. 只關閉指定 PID

若只要關閉其中一個：

```powershell
taskkill /F /PID <數字>
```

例如：`taskkill /F /PID 12345`

## 4. 切到專案目錄的正確方式

在 PowerShell 中「切換目錄」要用 `cd`，不能只打路徑：

```powershell
cd C:\Users\paul0\.minimax-agent\projects\3\cheersin
```

若只輸入 `C:\Users\paul0\.minimax-agent\projects\3\cheersin` 會被當成指令而報錯。

## 5. 執行 E2E / Build 前建議

- 執行 `npm run test:e2e:critical` 或 `npm run build` 前，**建議先關閉多餘的 node**（避免埠 3000/3099 衝突、記憶體不足或 ECONNRESET）。
- **一鍵關閉所有 node**：`npm run stop:dev`（專案內已定義 script，Windows 執行 `taskkill /F /IM node.exe`）。
- 關閉後請重新 `npm run dev` 再進行開發。
