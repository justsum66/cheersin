# 三殺手功能 — 30 項實作任務清單

依報告 69–114 與 roadmap 拆成 30 項可追蹤任務；完成即打勾。

## 派對直播房 (Live Party Room) — 10 項

1. [x] 遊戲房 API 已支援多人同房（game_rooms、game_room_players、game_states）
2. [x] 派對直播房專屬入口 `/party-room` 佔位頁
3. [x] 前端：派對房專屬 UI（房主選遊戲、邀請連結、人數顯示）
4. [x] Realtime：房主選遊戲後廣播 game_id（game_states party-room + 輪詢），全房同步進入同一遊戲
5. [x] 乾杯按鈕 UI：全員同時按下觸發（navigator.vibrate + 音效 + confetti）
6. [x] 乾杯後端/Realtime：同步「乾杯」事件與計數（POST game-state cheersCount）
7. [x] 免費房限制：4 人、30 分鐘（POST 建立時依 tier 設定 expires_at / max_players）
8. [x] 付費解鎖：12 人、無限時、18+ 遊戲（與 subscription_tier 整合）
9. [x] 邀請流程：生成連結（inviteUrl /party-room?room=slug）、建立即回傳
10. [x] 房間結束：到期自動關房、顯示統計

## 酒局劇本殺 (Drunk Script Murder) — 10 項

11. [x] 劇本殺專屬入口 `/script-murder` 佔位頁
12. [x] 劇本資料結構：scripts、script_chapters、script_roles 表設計與 migration
13. [x] 劇本內容：章節、角色卡、線索、投票節點、懲罰規則
14. [x] 房間模式：建立「劇本殺房」，綁定 script_id，4–8 人加入
15. [x] 角色分配：加入後隨機/指定角色，每人手機顯示角色卡
16. [x] 前端：角色卡與線索展示、投票 UI
17. [x] 狀態同步：當前章節、誰已投票、懲罰結果（Realtime / game_states）
18. [x] 至少 1 支短劇本（20 分鐘）上線
19. [x] 18+ 劇本：情侶專屬、權限與訂閱整合
20. [x] 劇本殺與學習/遊戲入口導流

## AI 派對 DJ (AI Party DJ) — 10 項

21. [x] 派對 DJ 專屬入口 `/party-dj` 佔位頁
22. [x] 編排引擎 API：`POST /api/party-dj/plan`（人數、時長、allow18 → phases + gameIds）
23. [x] 前端：表單輸入人數/時長/氣氛 → 呼叫 plan API 顯示編排結果
24. [x] 「開始派對」按鈕：跳轉 /games 並預填推薦遊戲或開房
25. [x] 免費用戶限制：僅能編排 30 分鐘（API 或前端依訂閱檢查）
26. [x] 付費用戶：無限時長編排
27. [x] 階段過渡：transitionText 顯示（如「接下來更刺激！」）
28. [x] 可選：AI 生成 transitionText（LLM）取代固定文案
29. [x] 與 AI 助理整合：助理內「派對策劃」引導至 /party-dj
30. [x] 編排結果分享：生成連結或圖片供社交分享

---

**當前完成：** **30/30 已完成**（全部任務已實作並勾選）。
