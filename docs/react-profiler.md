# P2-258：React.Profiler 性能分析

在開發時用 `<Profiler>` 包裹關鍵區塊，可量測 render 時間與 commit 次數。

- **用法**：`<Profiler id="GamesList" onRender={(id, phase, actualDuration) => { console.log(id, phase, actualDuration) }}>{children}</Profiler>`
- **注意**：僅在 development 使用，production 會略過 callback；可用 `process.env.NODE_ENV === 'development'` 條件渲染 Profiler。
- **建議**：對遊戲大廳列表、AI 對話區等重渲染較多的區塊先加 Profiler 找出瓶頸。
