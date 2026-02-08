# P2-240：Web Workers 處理密集計算

將客戶端密集計算（大量數據處理、複雜運算）移至 Web Worker，避免阻塞主線程、保持 UI 響應。

## 使用場景

- 大量列表排序/篩選（如 10000+ 筆遊戲或酒款）
- 離線資料壓縮/解壓
- 簡單的本地 AI 推理（若未來引入 WASM 模型）

## 範例：主線程呼叫 Worker

```javascript
// public/worker-calc.js
self.onmessage = (e) => {
  const { type, data } = e.data
  if (type === 'sort') {
    const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
    self.postMessage({ type: 'sort', result: sorted })
  }
}
```

```typescript
// 主線程
const worker = new Worker(new URL('/worker-calc.js', import.meta.url))
worker.postMessage({ type: 'sort', data: hugeList })
worker.onmessage = (e) => setSorted(e.data.result)
```

## Next.js 注意

- Worker 檔案放 `public/` 或使用 `worker-loader`/Webpack 配置
- 使用 `typeof window !== 'undefined'` 再 new Worker，避免 SSR 報錯

## 當前狀態

文檔與架構已就緒；實際 Worker 將在出現明顯主線程瓶頸時加入（如虛擬化列表的排序）。
