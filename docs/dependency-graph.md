# Dependency Graph 說明

本文件說明如何生成與解讀專案模塊依賴關係，以利重構與發現循環依賴。

## 生成方式

可使用下列工具之一（需先安裝）：

- **madge**：`npx madge --extensions ts,tsx --circular src/`
  - 列出循環依賴：`npx madge --extensions ts,tsx --circular src/`
  - 生成可視化：`npx madge --extensions ts,tsx --image graph.svg src/`
- **dependency-cruiser**：可配置規則並輸出圖或 JSON，適合納入 CI。

## 本專案結構要點

- **app/**：Next.js App Router 頁面與 API 路由，依賴 **components**, **lib**, **config**。
- **components/**：UI 組件，依賴 **lib**, **config**, **hooks**；盡量不依賴 **app**。
- **lib/**：工具函數、API 客戶端、業務邏輯，依賴 **config** 與 **types**；避免依賴 **components** 或 **app**。
- **config/**：靜態配置與常數，盡量無或最少依賴。

發現循環時，應抽離共用模塊到 **lib** 或 **types**，或調整依賴方向，使依賴單向（例如 app → components → lib → config）。
