# 遊戲列表評分研究

依據合併計畫「Script-Murder + 遊戲列表」產出。評分方法、移除決策依據與 10 項個別遊戲優化任務。

---

## 一、評分方法論

### 維度（各 1–10 分）

| 維度 | 說明 |
|------|------|
| 趣味性 | 派對情境下的娛樂價值 |
| 互動性 | 玩家間互動程度 |
| 重玩價值 | 重複遊玩新鮮感 |
| 派對適用性 | 多人聚會適用性 |
| 兩人友善 | 2 人可玩、情侶約會友善 |
| UI/UX 成熟度 | 元件完成度、流程順暢 |

### 資料來源

- GAMES_META 既有欄位：popular、difficulty、twoPlayerFriendly、estimatedMinutes
- games-favorites 的 localStorage 評分（getGameRatings）
- 既有 REMOVED 註記：drink-or-safe 2.5、spin-bottle 2.0、imitate-me 3.0、time-freeze 3.0、stare-contest 2.5

---

## 二、5 款移除決策

| Game ID | 名稱 | 綜合分 | 移除理由 |
|---------|------|--------|----------|
| finger-guessing | 猜拳 | 3.5 | 機制過於簡單，僅 2 人，互動單一 |
| coin-flip | 拋硬幣 | 3.5 | 與 dice 功能重疊（隨機二選一） |
| truth-wheel | 真心話轉盤 | 4.0 | 與 truth-or-dare 重疊，互動較少 |
| fortune-draw | 命運抽籤 | 4.0 | 與 lucky-draw 概念重疊 |
| finger-point | 手指快指 | 4.0 | 與 reaction-master 重疊，玩法較單薄 |

**執行**：從 `games.config.ts` 的 GAMES_META、GAME_CATEGORY_MAP 移除；從 `GameLazyMap.tsx` 的 GAME_LOADERS 移除。元件檔案暫留以供復用。

---

## 三、10 項個別遊戲優化任務（GAME-OPT）

| ID | 遊戲 | 優化內容 | 優先 |
|----|------|----------|------|
| GAME-OPT-001 | truth-or-dare | 真心話/大冒險題庫分類（親友/辣味）與搜尋 | P2 |
| GAME-OPT-002 | roulette | 自訂玩家名單拖曳排序與匯入 | P2 |
| GAME-OPT-003 | number-bomb | 自訂數字範圍與炸彈數量 | P2 |
| GAME-OPT-004 | never-have-i-ever | 題目難度分級（輕/中/辣） | P2 |
| GAME-OPT-005 | kings-cup | 抽牌規則與懲罰可自訂 | P2 |
| GAME-OPT-006 | hot-potato | 倒數秒數可調整（3–15 秒） | P2 |
| GAME-OPT-007 | 369-clap | 支援自訂禁語數字（非僅 3/6/9） | P2 |
| GAME-OPT-008 | category-chain | 新增分類選項（電影/明星/品牌） | P2 |
| GAME-OPT-009 | russian-roulette | 動畫與音效強化緊張感 | P2 |
| GAME-OPT-010 | number-bomb | 歷史紀錄（最近 5 局結果）顯示 | P2 |

---

## 四、紀錄

| 日期 | 摘要 |
|------|------|
| 2026-02-12 | 建立評分研究文件；移除 finger-guessing、coin-flip、truth-wheel、fortune-draw、finger-point；TASKS-170 新增 GAME-OPT-001～010 |
| 2026-02 | **縮減至 85 款**：依六維評分與相似度，合併移除 7 款、低分/手機不適合移除 7 款，共 14 款下架。詳見 `docs/games-audit-85.md`。 |
