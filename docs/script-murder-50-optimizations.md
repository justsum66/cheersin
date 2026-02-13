# 劇本殺 50 項優化任務

審查範圍：`/script-murder` 相關模組、功能、顯示、UX/UI。

## 一、大廳 (Lobby)

| # | 任務 | 狀態 |
|---|------|------|
| 1 | 劇本卡片：加入 min/max 人數與時長標籤（已有 playersAndDuration 時確保顯示） | 已有 |
| 2 | 劇本卡片：hover 時輕微陰影/邊框強化，提升可點擊感 | 已完成 |
| 3 | 現有房間列表：空狀態文案與「建立房間」引導 | 已完成 |
| 4 | 現有房間列表：每項顯示劇本標題、人數、加入 CTA | 已完成 |
| 5 | 大廳錯誤區塊：增加「返回首頁」連結 | 已完成 |
| 6 | 大廳 loading：骨架數量改為 6 與 grid 一致 | 已完成 |
| 7 | 大廳標題區：副標題與 onboarding 視覺層級分離（字級/色） | 已完成 |
| 8 | 鎖定劇本：點擊時 toast 提示升級，避免無反饋 | 已完成 |
| 9 | 建立房間中：按鈕 disabled + loading 文案 | 已有 |
| 10 | 大廳：頁面標題 document.title 設為「劇本殺 | Cheersin」 | 已完成 |

## 二、房間大廳 (Room)

| # | 任務 | 狀態 |
|---|------|------|
| 11 | 邀請連結 input：長連結時 truncate 或顯示完整 slug，避免誤以為不完整 | 已完成 |
| 12 | 複製成功：按鈕短暫顯示「已複製」並可選自動復原 | 已有 |
| 13 | 加入表單：暱稱 2–20 字即時驗證與錯誤提示 | 已完成 |
| 14 | 玩家列表：空狀態與 1 人狀態文案區分 | 已有 |
| 15 | 房間過期：整塊提示 + 返回列表 CTA，不與一般內容混在一起 | 已完成 |
| 16 | 開始遊戲按鈕：房主才可點（非房主時隱藏或禁用並提示） | 已完成 |
| 17 | 離開房間：二次確認（避免誤觸） | 已完成 |
| 18 | 單人測試按鈕：加上「開發測試」小字說明 | 已完成 |
| 19 | 大廳 breadcrumb：當前劇本標題可讀性（字重/色） | 已有 |
| 20 | 房間大廳：document.title 設為「{劇本名} 房間 | 劇本殺」 | 已完成 |

## 三、遊戲中 (Play)

| # | 任務 | 狀態 |
|---|------|------|
| 21 | 章節進度：當前章節標示為「第 X / Y 章」 | 已有 |
| 22 | 進度條：提供 aria-valuetext 說明 | 已完成 |
| 23 | 角色卡：無 secretClue 時不顯示展開箭頭 | 已有 |
| 24 | 敘事節點：支援 highlights 關鍵詞高亮 | 已完成 |
| 25 | 投票節點：未投票時顯示「請選擇一項」提示 | 已完成 |
| 26 | 投票結果：顯示總投票人數文案 | 已完成 |
| 27 | 懲罰節點：確認按鈕 loading 狀態 | 已有 |
| 28 | 下一章按鈕：非房主時顯示「等待房主推進」提示 | 已完成 |
| 29 | 章節切換：reduce motion 時縮短或取消 transition | 已完成 |
| 30 | Play 頁：document.title 設為「{劇本名} 第 X 章 | 劇本殺」 | 已完成 |

## 四、結束 (Ended)

| # | 任務 | 狀態 |
|---|------|------|
| 31 | 結束統計：三張卡增加圖標 aria-hidden 與簡短 label | 已完成 |
| 32 | 再玩一次：連結加上 room slug 並說明「同房再開」 | 已有 |
| 33 | 結束頁：document.title 設為「本局結束 | 劇本殺」 | 已完成 |

## 五、頁面與資料 (Page / Data)

| # | 任務 | 狀態 |
|---|------|------|
| 34 | 房間 loading：統一骨架或 spinner，避免空白 | 已有 |
| 35 | 房間 404：使用專用 roomNotFoundIncomplete 文案（已有） | 已做 |
| 36 | Polling 間隔：房間大廳 3s 改為 5s 減輕負載 | 已完成 |
| 37 | createRoom 成功：toast 成功訊息後再 redirect | 已完成 |
| 38 | startGame 失敗：toast 錯誤並保留在 lobby | 已有 |
| 39 | 離開房間失敗：toast 錯誤不導向 | 已有 |
| 40 | scriptDetail 載入中：大廳顯示劇本標題 placeholder | 已有 |

## 六、無障礙與 i18n (A11y / i18n)

| # | 任務 | 狀態 |
|---|------|------|
| 41 | 大廳：主標題 h1，劇本列表 region 或 list 語義 | 已完成 |
| 42 | 房間：邀請區 label 與 input 關聯，複製按鈕 aria-label | 已有 |
| 43 | Play：章節區塊用 article 或 region + aria-label | 已完成 |
| 44 | 按鈕：所有主要 CTA 具備 min-h 48px 與 focus ring | 已有 |
| 45 | common.chapterProgress：確保 i18n 存在（current/total） | 已有 |
| 46 | scriptMurder 缺 key 時 fallback 顯示 key 不空白 | 已完成 |
| 47 | 錯誤邊界：error.tsx 連結使用 i18n | 已有 |

## 七、效能與程式品質

| # | 任務 | 狀態 |
|---|------|------|
| 48 | page.tsx：refetchRoomAndState 依賴陣列精簡避免多餘呼叫 | 已完成 |
| 49 | ScriptMurderPlay ContentNodeBlock：非 host 時不重複算 hasVote/hasPunishment | 已完成 |
| 50 | 劇本列表：虛擬捲動或分頁（若劇本數 >20）— 可選，見 ScriptMurderLobby TODO | 可選 TODO |

---

實作順序建議：1→10（Lobby）、11→20（Room）、21→33（Play/Ended）、34→40（Page）、41→50（A11y/效能）。
