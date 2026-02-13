# Copy & Content 審計檢查清單

## COPY-009：課程章節多語

- **範圍**：data/courses、messages（learn.*）
- **驗收**：課程標題、章節、學習目標有 zh-TW/en 等譯文，無缺譯
- **現況**：課程資料以 JSON 儲存，主要為 zh-TW；messages 有 learn.* 鍵；多語擴充時需同步 data 與 messages

## COPY-010：測驗題幹審閱

- **範圍**：quiz 靈魂酒測、learn 穿插測驗（course data quiz）
- **驗收**：無錯字、題意清晰
- **檢查**：`npm run validate:content` 驗證課程結構；題幹與選項格式一致

## COPY-005：學習模組課程內容深度

**驗收**：每課有 learningObjectives 與測驗對齊；內容與學習目標一致。

| 課程 | learningObjectives | 首屏展示 | validate |
|------|--------------------|----------|----------|
| wine-101 | ✅ 4 項 | ✅ LearnCourseContent 首屏 | ✅ |
| whisky-101 | ✅ 4 項 | ✅ 同上 | ✅ |
| white-wine | ✅ 4 項 | ✅ 同上 | ✅ |

- **實作**：`data/courses/*.json` 含 `learningObjectives`；`LearnCourseContent` 於標題區塊顯示
- **驗證**：`npm run validate:lessons`、`npm run validate:content` 通過
