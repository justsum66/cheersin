# P2-238：虛擬化長列表

**目標：** 對 AI 聊天歷史、酒款庫等極長列表使用虛擬化，只渲染可視區域，保持流暢。

## 建議

- **react-window** 或 **tanstack-virtual**：僅渲染可見項，減少 DOM 節點。
- **適用處：** `assistant/page.tsx` 對話列表、未來酒款庫列表。
- **實作：** 以 `FixedSizeList` 或 `useVirtualizer` 包裝列表，每項高度可估或動態測量。

## 參考

- [react-window](https://github.com/bvaughn/react-window)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
