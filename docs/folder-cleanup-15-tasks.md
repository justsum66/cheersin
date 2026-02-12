# FOLDER 整理 15 項任務

單一來源、目錄結構、重複元件合併、與 REAL_COMPLETION_RATE 對齊。

## 任務清單

| # | 狀態 | 說明 |
|---|------|------|
| F-01 | ☑ | 全站單一 Footer：僅 `src/components/navigation/Footer.tsx`，無重複 footer 元件 |
| F-02 | ☑ | 全站單一 Nav：主要導航由 `src/components/navigation/Navigation.tsx` 提供 |
| F-03 | ☑ | `src/components/games` 為遊戲元件與大廳集中目錄（GameCard、Lobby、GameLazyMap 等） |
| F-04 | ☑ | `src/app/api` 依功能分層：games、auth、subscription、webhooks、learn、chat 等 |
| F-05 | ☑ | `src/types` 集中：api-bodies.ts、script-murder.ts、games.ts（DC-12 型別集中） |
| F-06 | ☑ | 遊戲 API 路由：`api/games/rooms`、`[slug]/join`、`game-state`、`script-murder` 結構一致 |
| F-07 | ☑ | 房間/狀態 hook 單一來源：useGameRoom、useGameState、usePartyRoomState、useScriptMurderRoom/State |
| F-08 | ☑ | 複製邀請單一來源：useCopyInvite，無重複實作 |
| F-09 | ☑ | 輪詢單一來源：usePolling，script-murder / party-room 共用 |
| F-10 | ☐ | 重複 UI 元件合併：若有兩處以上相同按鈕/卡片樣式，抽成共用元件 |
| F-11 | ☑ | 頁面與 feature 對齊：party-room、script-murder、party-dj 各在對應 app 目錄下 |
| F-12 | ☑ | types 與 api 對齊：api-bodies 註解對應 route；games.ts 供前端與註解 |
| F-13 | ☐ | 未使用或棄用檔案清理：無 dead code 目錄或明顯廢棄元件 |
| F-14 | ☐ | 文件與目錄對應：docs 內任務檔路徑與實際 src 結構可對照 |
| F-15 | ☑ | games.css 由 layout 引入，.games-* 類集中於 `src/components/games/games.css` |

## 備註

- F-01～F-02：REAL_COMPLETION_RATE 已載明單一 Footer/Nav。
- F-03～F-09：與 duplicate-code 任務對齊，DC-04～DC-08 完成後即滿足。
- F-10、F-13、F-14：可於後續迭代逐項審查與勾選。
