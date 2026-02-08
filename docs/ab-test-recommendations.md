# P2-402：AI 推薦 A/B 測試

- **目標**：對推薦演算法做 A/B 測試，依轉化率選擇策略。
- **要點**：用戶分桶（如 hash(userId) % 2）、一組看策略 A 一組看 B；記錄曝光與點擊/轉化，後台或分析工具比較。
- **API**：`api/recommendations` 可接受 `variant` 或由 server 依 bucket 決定回傳內容。
- **狀態**：文檔已建立；需與推薦 API 與分析埋點一併設計。
