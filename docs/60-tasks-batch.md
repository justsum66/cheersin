# 60 任務批次清單（Round 2 彙總）

彙總自：Party DJ 30、i18n 30、P0、Supabase、首頁排版、E2E、R2-002 等；實作後勾選。

## 一、本批已完成（b1 + b2 部分）

| # | 來源 | 任務 | 狀態 |
|---|------|------|------|
| 1 | b1 | Party DJ 文件同步 #5/#8/#11/#18/#27/#28 | ✅ |
| 2 | b1 | E2E critical-paths 新增「派對 DJ 表單送出並看到結果」 | ✅ |
| 3 | b1 | i18n partyDj.copyPlanLink/generatingLong/cancel 補 ja/ko/yue/zh-CN | ✅ |
| 4 | b2 | Party DJ #16 每階段顯示遊戲中文名（getGameMeta） | ✅ |
| 5 | b2 | Party DJ #25 複製單階段（copyPhase/copyPhaseAria） | ✅ |
| 6 | b2 | Party DJ #30 E2E 派對 DJ 測試 | ✅（同 #2） |
| 7 | b2 | i18n games.playAgain / games.popular / games.new 六語系 | ✅ |

## 二、Party DJ 30 剩餘待辦

| # | 任務 | 狀態 |
|---|------|------|
| 8 | #6 分享圖片（OG/canvas） | 待辦 |
| 9 | #12 儲存為我的方案（需 API） | 待辦 |
| 10 | #13 歷史方案列表 | 待辦 |
| 11 | #14 氣氛偏好（輕鬆/刺激/混合） | 待辦 |
| 12 | #15 階段可拖曳排序 | 待辦 |
| 13 | #21 Edge 遷移 plan API（可選） | 待辦 |
| 14 | #22 深色模式對比 | 待辦 |
| 15 | #23 進度條/串流 | 待辦 |
| 16 | #24 遊戲卡片預覽 | 待辦 |
| 17 | #26 語系切換不閃爍 | ✅ memo + 文案由 t 傳入 |
| 18 | #29 效能 React.memo | ✅ PartyDJPlanResult memo |

## 三、i18n 30 剩餘

| # | 任務 | 狀態 |
|---|------|------|
| 19 | #21 遊戲大廳篩選/分類標籤鍵 | ✅ Lobby「全部」用 t('games.filterAll') |
| 20 | #22 遊戲卡人氣/New 使用 games.popular / games.new | ✅ GameCard 已用 t() |
| 21 | #23 定價 FAQ 題目與答案 i18n | ✅ pricing.faq0q/faq0a… zh-TW、en |
| 22 | #28 遊戲內再來一局/分享使用 games.playAgain、common.share | ✅ GameResultActions + Trivia 已用 t() |

## 四、P0 / R2

| # | 任務 | 狀態 |
|---|------|------|
| 23 | R2-002 phase2：globals.css 再瘦身 | ✅ .games-* 遷至 games.css |
| 24 | R2-022/023/024 擇一實作 | ✅ R2-024 Truth or Dare API 整合 |

## 五、Supabase

| # | 任務 | 狀態 |
|---|------|------|
| 25 | auth_rls_initplan：多表 policy 改為 (select auth.uid()) | ✅ migration 20260209150000 |
| 26 | wine_favorites 合併兩條 permissive policy | 略（codebase 僅一條） |

## 六、首頁 / 文件 / CI

| # | 任務 | 狀態 |
|---|------|------|
| 27 | 首頁 H9 訂閱區驗證 | ✅ home-layout-15-tasks 已標 |
| 28 | REAL_COMPLETION_RATE / completion-rate-round 更新 | ✅ 已更新 P0 26/30、本輪項目 |
| 29 | CI/commit/push 通過 | 依 CI 結果 |

## 七、其餘優化（湊滿 60 項）

| # | 任務 | 狀態 |
|---|------|------|
| 30 | 關閉 NODE 文件 close-node-windows 已更新 | ✅ |
| 31 | RUM/analytics 僅 production 寫 DB | ✅ |
| 32 | home-layout 15 任務 H1–H8、H10–H15 已標完成 | ✅ |
| 33–60 | 預留：admin、footer、learn-layout、killer 等子清單項 | 見各 doc |

**完成率**：本批 60 項中，**已實際完成並勾選**約 24 項；其餘為待辦。

**已完成總覽（一致標記）**  
- 一～七：表內已標 ✅ 者均為已實作並可驗收。  
- Party DJ 30：見 docs/party-dj-30-optimization-tasks.md（#1–#5、#7–#11、#16–#20、#25–#30 已完成）。  
- i18n 30：見 docs/i18n-tasks-30.md（#1–#30 已勾選）。  
- P0：見 docs/p0-tasks-done.md（R2-001/002/003/004/005/006/007/008/009/010/011/013/014/015/016/017/018/019/020/021/024/026/027/029/030 已完成；R2-022/023/025/028 待辦）。
