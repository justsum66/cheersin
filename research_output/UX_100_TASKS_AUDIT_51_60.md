# 設計與 UX 審查 — 任務 51–60 執行狀態

**範圍**：DESIGN_UX_100_TASKS.md 第 51～60 個任務（P2×10）  
**狀態圖例**：✅ 已實作（審查確認）｜🔄 本次實作｜⏳ 待實作

---

## P2 — 任務 51–60

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 51 | 遊戲內主按鈕與懲罰輪盤視覺一致 | ✅ | PunishmentWheel：主按鈕 btn-primary、全部按鈕 games-focus-ring、48px |
| 52 | 學院影片播放器控制 48px 與焦點環 | ✅ | VideoPlayer：wrapper games-focus-ring；原生 controls webkit min-h-[48px] |
| 53 | Cookie 橫幅關閉動畫 | ✅ | CookieConsentBanner：AnimatePresence exit y:100% opacity:0 duration 0.3 |
| 54 | Footer 飲酒提醒字級與對比 | ✅ | HomePageClient：text-sm text-white/70、role="note" aria-label |
| 55 | Nav 行動選單開合動畫 | ✅ | Navigation：MOBILE_MENU_DURATION_MS 300、opacity + 項目 stagger |
| 56 | Profile 成就卡 hover 與焦點環 | ✅ | profile/page：hover:shadow-lg hover:border-white/30、games-focus-ring |
| 57 | Quiz 結果酒款卡圓角與陰影 | ✅ | quiz/page：glass-card rounded-2xl shadow-glass-1、酒款區一致 |
| 58 | 助理快速回覆按鈕 48px 與間距 | ✅ | assistant/page：QUICK_PROMPTS/SUGGESTION 改 min-h-[48px]、games-focus-ring |
| 59 | 定價對比表 RWD 與捲動 | ✅ | pricing/page：overflow-x-auto min-w-0 方案功能對比表區 |
| 60 | 登入後導向提示（Toast 或文案） | ✅ | login/page：toast.success + setTimeout redirect（既有） |

---

## 本次實作摘要

- **PunishmentWheel.tsx**：篩選/玩家/轉動/下一輪/我完成了/排行榜等按鈕加 games-focus-ring；主行動 btn-primary。
- **assistant/page.tsx**：快捷提問與分類建議按鈕 min-h-[48px]、py-3、games-focus-ring。
- **constants/nav.ts**：MOBILE_MENU_DURATION_MS 200→300，註解 P2 任務 55。
