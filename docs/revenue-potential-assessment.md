# Cheersin 收入潛能評估（70 專家 + 20 網紅視角）

**依據：** cheersin_500_complete_report.md、Supabase 資料結構、現有訂閱與遊戲房設計。

## 1. 現有變現基礎

| 項目 | 狀態 | 說明 |
|------|------|------|
| 訂閱制 | ✅ | subscriptions 表、PayPal 整合、Basic/Premium、webhook 同步 |
| 遊戲房 | ✅ | game_rooms / game_room_players / game_states，可擴為派對直播房 |
| 品酒學院 | ✅ | 課程 + chapter_progress、學習進度同步 |
| AI 助理 | ✅ | Groq/OpenRouter、RAG（Pinecone）、推薦遊戲與配酒 |

## 2. 報告預估（三殺手功能）

| 功能 | 預估收入影響 | 來源 |
|------|--------------|------|
| 派對直播房 (Live Party Room) | 月訂閱轉化率 **3–5 倍** | 免費 4 人/30 分鐘 → 付費 12 人/無限時/18+ |
| 酒局劇本殺 (Script Murder) | 訂閱收入 **40–60%** | 獨家劇本、每劇本僅能玩一次 → 持續訂閱 |
| AI 派對 DJ | 最強免費轉付費鉤子 | 免費用戶 30 分鐘編排、付費無限 |

## 3. 資料庫與收入相關表

- **subscriptions**：plan_type (free/basic/premium)、status、paypal_subscription_id、price_ntd
- **payments**：金額、狀態、paypal_transaction_id
- **game_rooms**：未來可區分 free vs premium 房（人數、時長、18+）
- **profiles**：subscription_tier、xp、level（遊戲化與留存）

## 4. 收入潛能結論

- **短期：** 現有訂閱 + 定價頁 + 遊戲/學習鎖點即可產生收入；PayPal 與 Supabase 已打通。
- **中期：** 派對直播房上線後，每開房帶 3–11 新用戶，轉化 3–5 倍可顯著提升 MRR。
- **長期：** 劇本殺為內容護城河，貢獻 40–60% 訂閱收入；AI DJ 拉高免費→付費轉化。
- **風險：** 依賴單一支付 (PayPal)、單一區域 (台灣) 先驗證；後續可擴 Stripe、東南亞。

## 5. 驗證方式

- `/api/health` 已涵蓋 Supabase、Pinecone、PayPal 連通性。
- 訂閱流程：pricing → subscription API → PayPal → webhook → profiles.subscription_tier。
- 收入追蹤：subscriptions + payments 表可匯出 MRR/付費人數；可接 GA4 事件（P3-450）。
