# 83 位專家 + 30 位網紅 — 是否全站重設計評估

依據 round2 評分：第一印象 6.0、付費價值感 4.1、整體約 5.1/10；自評體感低於報告數字。

## 專家要點摘要

- **Vercel #2**：globals 災難 → 已啟動 R2-002 遷移（第一階段完成：移除未使用區塊）
- **Meta #3**：God Component → HomePageClient / 遊戲頁已拆分，持續模組化
- **Google #4**：LCP、測試 → 預載 logo、E2E critical-paths 已覆蓋
- **Apple HIG #16**：動畫、觸覺 → whileTap、AnimatePresence、BackToTop 滑入已做
- **無障礙 #24**：幾乎為零 → 本輪加強：Footer/Header aria、Party DJ 表單 aria、focus-visible
- **動態 #25**：Framer Motion 未充分利用 → 遊戲卡 hover、Modal、BackToTop 已用
- **Stripe #17 / SaaS #34**：付費價值感與轉換路徑 → 定價頁 FAQ、試用/退款文案已有；可再強化 CTA 與信任徽章

## 網紅要點摘要

- 夜店王/實況主：派對房、直播體驗 → 派對直播房、Party DJ 已上線
- 品酒師：內容深度 → 品酒學院、AI 侍酒師
- 手機攝影師：分享到 IG → 分享編排、測驗結果分享
- 語言學習：多語系 → zh-TW / zh-CN / en / ja / ko / yue

## 當前弱項

1. **付費價值感**：方案對比、試用說明可再突出；升級路徑可更明確
2. **第一印象**：首頁 CTA 與信任感可加強；globals 仍待進一步瘦身
3. **無障礙**：鍵盤動線、ARIA 覆蓋率仍可提升
4. **效能**：部分長列表/遊戲大廳可再優化（虛擬化、code split）

## 建議優先順序

| 階段 | 內容 |
|------|------|
| **P0** | 雙 Footer 已合併；P0 達 80%；E2E 修復；Supabase advisors 修復 |
| **P1** | 動畫/微互動、i18n 30 項、Party DJ 30 項其餘項、付費牆提示（R2-181） |
| **局部 redesign** | 若 2～3 輪後評分仍低：單頁或模組級（首頁、定價、遊戲大廳） |

## 結論：不建議一次性全站重設計

- 優先修 P0 + 雙 Footer + E2E + Supabase，再透過 P1 提升「付費價值感」與第一印象
- 全站重寫成本高、風險大；以迭代優化取代一次大改
- 若 2～3 輪後評分仍低，再考慮單頁或模組級 redesign（例如首頁、定價、遊戲大廳）
