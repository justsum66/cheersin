# P2-383：AI 個性化推薦

根據用戶品酒偏好（靈魂酒測、歷史互動）提供個性化酒款與遊戲推薦。

## 現有基礎

- **靈魂酒測**：結果存 localStorage / 可擴充至 profile
- **口味偏好**：`TASTE_PREFERENCES_KEY`、願望清單
- **AI 系統提示**：已注入「派對/遊戲配酒」、遊戲列表推薦（P2-378、P2-404）

## 擴充方向

1. **系統提示注入**：將用戶的 `preferredWineTypes`、quiz 結果關鍵字寫入 system prompt，讓回覆更貼合口味。
2. **推薦 API**：`GET /api/recommendations/wines?limit=5` 依 profile + 行為回傳推薦列表（可先規則型，再接協同過濾）。
3. **學習**：從歷史對話與點讚/倒讚（ai_feedback）微調或過濾推薦。

## 當前狀態

AI 助理已具備場景與遊戲推薦；個人化維度（口味、歷史）可於下一迭代注入 system prompt 與推薦 API。
