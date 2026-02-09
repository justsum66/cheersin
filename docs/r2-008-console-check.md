# R2-008：Console 錯誤/警告修復檢查清單

開發模式下開啟以下頁面，確認無新增的 `console.error` / `console.warn`（如 hydration、missing key、deprecated API）。

## 必查頁面

| 頁面 | 路徑 |
|------|------|
| 首頁 | `/` |
| 遊戲大廳 | `/games` |
| 靈魂酒測 | `/quiz` |
| 派對直播房 | `/party-room` |
| 酒局劇本殺 | `/script-murder` |
| 登入 | `/login` |

## 常見來源

- **Hydration**：服務端與客戶端渲染不一致 → 檢查 `suppressHydrationWarning` 或統一資料來源
- **Missing key**：列表項缺少 `key` 或 `key` 不穩定
- **Deprecated API**：React / Next 棄用 API → 依官方遷移指南更新

完成後在本文件或 killer-features / 計劃中打勾。
