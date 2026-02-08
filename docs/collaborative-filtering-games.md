# P2-380：協同過濾推薦遊戲

- **目標**：依用戶遊戲行為（玩過哪些、時長）推薦「玩過這個的人還喜歡…」。
- **資料**：需記錄 game_plays 或類似事件（game_id、user_id、played_at）；可從 game_states / 房間記錄彙總。
- **API**：`GET /api/recommendations/games?userId=xxx` 或依 session 推斷，回傳推薦 game_id 列表。
- **狀態**：文檔已建立；需先有播放記錄與資料量再實作演算法。
