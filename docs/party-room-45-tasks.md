# 派對直播房 45 項優化任務

前 15 項偏 UX/動畫/顯示；後 30 項偏功能/模組/邏輯/進階。

## 第一批（1～15）— UX / 動畫 / 顯示

| # | 狀態 | 說明 |
|---|------|------|
| PR-01 | ☑ | 建立房間時 loading 骨架（Skeleton）取代單純 spinner |
| PR-02 | ☑ | 房間卡入場動畫（motion.div + key 重入場、stagger） |
| PR-03 | ☑ | 本局統計卡 motion 入場（乾杯次數、剩餘時間區塊） |
| PR-04 | ☑ | 剩餘時間以 AnimatedNumber 或 CountDown 顯示 |
| PR-05 | ☑ | 複製邀請按鈕 motion（whileTap、成功態圖標切換） |
| PR-06 | ☑ | 乾杯按鈕觸覺與 confetti 強化（尊重 reducedMotion） |
| PR-07 | ☑ | 房主選遊戲 UI：下拉或遊戲網格、currentGameId 顯示 |
| PR-08 | ☑ | 玩家頭像列表（頭像或首字、順序） |
| PR-09 | ☑ | 房間已結束區塊動畫（AnimatePresence + 統計卡） |
| PR-10 | ☑ | 錯誤狀態重試按鈕與文案 |
| PR-11 | ☑ | RWD 與 safe-area；小螢幕按鈕 min-h 48px |
| PR-12 | ☑ | 焦點管理與 aria（dialog、live region、按鈕 label） |
| PR-13 | ☑ | 派對房專用 empty state（房間已結束/不存在時 PartyRoomEnded 插圖與 CTA、i18n key） |
| PR-14 | ☑ | 房內「即將開始」或倒數提示（可選） |
| PR-15 | ☑ | 主題色與 glass 風格與全站一致（glass-card、primary） |

## 第二批（16～45）— 功能 / 模組 / 邏輯

| # | 狀態 | 說明 |
|---|------|------|
| PR-16 | ☑ | 拆出 PartyRoomLobby、PartyRoomActive、PartyRoomEnded 子組件 |
| PR-17 | ☑ | 抽出 usePartyRoom(slug)、usePartyRoomState(slug) hook |
| PR-18 | ☑ | Realtime 訂閱取代輪詢（Supabase Realtime rooms/state） |
| PR-19 | ☐ | 房主轉讓：API + UI（選擇新房主） |
| PR-20 | ☐ | 踢人：API + UI（房主可移出玩家） |
| PR-21 | ☐ | 延長房間時間：API + UI（若後端支援 expiresAt 更新） |
| PR-22 | ☑ | 最大人數 4/8/12 可選（R2-183：Premium 解鎖 12 人） |
| PR-23 | ☐ | 遊戲選擇與 currentGameId 同步至所有客戶端（Realtime 或輪詢） |
| PR-24 | ☐ | 乾杯計數樂觀更新與衝突處理（伺服器為真相源） |
| PR-25 | ☑ | 離開房間並清理 state；重連還原（rejoin 或新連結）— API 與 UI 已接線，派對房目前無 join 流程故 myPlayerRowId 為 null，待有「加入房間」步驟後即可顯示離開按鈕 |
| PR-26 | ☑ | 錯誤邊界與重試策略（fetchRoom/fetchPartyState） |
| PR-27 | ☑ | 日誌與監控（建立/加入/乾杯/選遊戲 analytics） |
| PR-28 | ☑ | i18n 補齊 partyRoom.* 六語系 |
| PR-29 | ☑ | 無障礙與鍵盤操作（Esc 關閉、Enter 送出） |
| PR-30 | ☑ | E2E：建立房間 → 複製連結 → 加入 → 乾杯 → 房主選遊戲 |
| PR-31 | ☑ | POST /api/games/rooms 參數校驗（partyRoom、maxPlayers）；回傳統一格式 |
| PR-32 | ☑ | game-state 讀寫型別集中（PartyState）；Zod 校驗 payload |
| PR-33 | ☐ | 邀請連結短網址或 QR 碼（可選） |
| PR-34 | ☑ | 房間列表（進行中房間）可選入口 — GET ?list=active、大廳區塊「進行中房間」連結 |
| PR-35 | ☑ | 房主可結束房間（提前到期）；API + 確認 dialog |
| PR-36 | ☑ | 玩家列表顯示「房主」標籤與順序 |
| PR-37 | ☑ | 訂閱狀態檢查：免費房主見「解鎖 12 人」引導至定價頁 |
| PR-38 | ☑ | 離線/網路中斷提示（可選）— 全站 layout 已有 OfflineBanner |
| PR-39 | ☐ | 乾杯歷史或最近 N 次動畫回放（可選） |
| PR-40 | ☐ | 房間 slug 唯一性與過期清理（後端 cron 或 TTL） |
| PR-41 | ☑ | 單元測試：game-state 讀寫、cheers 遞增 — __tests__/api/game-state-route.test.ts、cheers-route.test.ts |
| PR-42 | ☑ | 型別 RoomInfo、PartyState 集中至 types 或 api-bodies |
| PR-43 | ☐ | 使用共用 useRoom/useGameState 取代重複 fetch（見 duplicate-code 任務） |
| PR-44 | ☑ | 列印樣式：房間資訊與統計可列印（可選）— .party-room-no-print 隱藏按鈕/連結 |
| PR-45 | ☑ | 文件：派對房流程、API、環境變數說明 |
