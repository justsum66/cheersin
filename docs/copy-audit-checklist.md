# Copy & Content 審計檢查清單

## COPY-005：學習模組課程內容深度

**驗收**：每課有 learningObjectives 與測驗對齊；內容與學習目標一致。

| 課程 | learningObjectives | 首屏展示 | validate |
|------|--------------------|----------|----------|
| wine-101 | ✅ 4 項 | ✅ LearnCourseContent 首屏 | ✅ |
| whisky-101 | ✅ 4 項 | ✅ 同上 | ✅ |
| white-wine | ✅ 4 項 | ✅ 同上 | ✅ |

- **實作**：`data/courses/*.json` 含 `learningObjectives`；`LearnCourseContent` 於標題區塊顯示
- **驗證**：`npm run validate:lessons`、`npm run validate:content` 通過
