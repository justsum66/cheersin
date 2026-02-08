# P2-400：AI 學習助手

在品酒學院中整合 AI 學習助手：用戶可針對當前課程內容提問，AI 提供解答與補充。

## 實作方式

1. **入口**：在課程頁或學習導航加入「問 AI 助手」連結，導向 `/assistant` 並帶入預填問題（如 `?q=單寧是什麼` 或課程標題）。
2. **上下文**：可選將當前課程 ID 或章節名稱以 query 傳入，助理 system prompt 可強調「用戶正在學習某課程，回答請配合初學者」。
3. **學習頁直連**：`/learn` 或 `/learn/[courseId]` 放置按鈕：「不懂？問 AI」→ `Link` 至 `/assistant?context=learn&course=wine-basics`。

## 與現有助理的關係

- 不新增獨立頁面，複用 `/assistant` 與既有 chat API。
- 僅增加入口與可選的 context 參數，必要時在 system prompt 中注入「當前課程」以提升回答針對性。

## 當前狀態

文檔已建立；學習頁可於 UI 迭代時加入「問 AI」入口並傳入 `q` / `context`。
