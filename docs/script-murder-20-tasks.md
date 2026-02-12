# 劇本殺 20 項優化任務

對應多領域優化計畫 — 模組、功能、前端、顯示、UX/UI、動畫、邏輯。

## 任務清單

| # | 狀態 | 說明 |
|---|------|------|
| SM-01 | ☑ | 將 page 拆成 ScriptMurderLobby、ScriptMurderRoom、ScriptMurderPlay 子組件或 feature 資料夾 |
| SM-02 | ☑ | 抽出 useScriptMurderRoom、useScriptMurderState hook；共用類型集中到 types/script-murder.ts |
| SM-03 | ☑ | 加入「離開房間」並同步 game_state；房主可踢人（若後端支援） |
| SM-04 | ☑ | 章節/投票/懲罰完成狀態持久化與重連還原；劇本列表分頁或虛擬滾動 |
| SM-05 | ☑ | 劇本卡 RWD、載入骨架、空狀態插圖；房間內玩家列表頭像與順序 |
| SM-06 | ☑ | 章節標題與進度條；投票結果視覺化（長條圖或比例）；懲罰結果區塊樣式統一 |
| SM-07 | ☑ | 複製邀請成功 Toast 與 aria；房間已滿/已結束明確提示 |
| SM-08 | ☑ | 開始遊戲前確認 dialog；投票倒數或讀秒；鍵盤/無障礙（focus、Enter 送出） |
| SM-09 | ☑ | 劇本列表入場 stagger 加強；房間進入淡入 |
| SM-10 | ☑ | 章節切換 transition；投票結果揭曉動畫；懲罰結果出現動畫 |
| SM-11 | ☑ | 輪詢防抖或改用 Realtime 訂閱（若 Supabase 已接） |
| SM-12 | ☑ | 錯誤重試與錯誤邊界；樂觀更新（投票、下一章）與 rollback |
| SM-13 | ☑ | 劇本殺全頁 i18n：改用 t() 並補齊六語系 key（scriptMurder.*）— 大廳/列表/按鈕/結束/遊戲中已接線 |
| SM-14 | ☑ | API 錯誤訊息統一（stripHtml、回傳 message）；join/script-murder 校驗 |
| SM-15 | ☑ | 房間 slug 編碼一致（encodeURIComponent）；404 與 5xx 處理 |
| SM-16 | ☑ | 角色揭曉後可再次收合/展開；秘密線索摺疊區塊無障礙 |
| SM-17 | ☑ | 本局統計卡（chaptersCompleted、voteRounds、punishmentCount）視覺強化 |
| SM-18 | ☑ | 建立房間 loading 態與按鈕 disabled；加入房間名稱驗證與字數限制 |
| SM-19 | ☑ | 劇本詳情鎖定（locked）時不顯示完整章節/角色；權限提示 |
| SM-20 | ☑ | E2E 或 smoke：選劇本 → 建立房間 → 加入 → 開始 → 一輪投票/懲罰 |
