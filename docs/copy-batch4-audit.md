# COPY Batch 4 審計（COPY-004, 005, 009～015）

對應計畫「下一批 70 任務」Batch 4。

## COPY-004：訂閱頁價值說明與 FAQ

- **狀態**：已實作。`pricing/page.tsx` 使用 `PRICING_PLANS_DISPLAY`、`COMPARISON_ROWS_PRICING`；FAQ 題目與答案從 messages `pricing.faq0q`/`faq0a`…～`faq6q`/`faq6a` 讀取（六語皆有）。
- **驗收**：訂閱頁有價值說明與 FAQ，減少猶豫。

## COPY-005：學習模組課程內容深度與測驗對齊

- **狀態**：課程資料（`data/courses/*.json`）具 `title`、`description`、`chapters[].title`、`content`、`quiz`；每章 quiz 與該章 content 對齊。可於課程層級補「學習目標」欄位（如 `learningObjectives: string[]`）供首屏展示。
- **驗收**：每課有目標（description 或 learningObjectives）與測驗對齊。

## COPY-009：課程章節標題與描述一致多語

- **狀態**：目前課程 JSON 為單語（繁中）；多語策略為從 messages `learn.courses.{courseId}.title` 等讀取，或後台 CMS 多語欄位。見 I18N-006。
- **驗收**：無缺譯；可選實作 messages.learn.courses.* 對應各課程/章節。

## COPY-010：測驗題幹與選項無錯字與語意不清

- **狀態**：測驗題來自 `data/courses/*.json` 之 `chapters[].quiz`；需人工審閱題幹與選項。可建立審閱檢查清單或定期 review。
- **驗收**：審閱通過。

## COPY-011：郵件與推播文案多語與品牌一致

- **狀態**：可選。若有郵件/推播模板，需多語 key 與品牌聲調一致。
- **驗收**：可選實作。**Phase B 補註**：待產品需求；Resend/郵件模板若有則補 messages key。

## COPY-012：法律頁（隱私、條款）與產品一致

- **狀態**：`privacy`、`terms` 頁面存在（`src/app/privacy`、`src/app/terms`）；需定期審閱與產品功能一致（訂閱、資料收集、Cookie 等）。
- **驗收**：定期審閱。**Phase B 抽檢**：隱私/條款路由與 layout meta 已存在；Footer 或登入頁若有連結可抽檢可達。

## COPY-013：成就與徽章名稱與描述

- **狀態**：`BADGE_LABELS` 於 `src/lib/gamification.ts`；`learn/badges` 頁面使用之。可將名稱改為 messages `learn.badges.*` 以支援多語。
- **驗收**：可譯且一致；可選遷移至 messages。**Phase B 補註**：可選；若有 badges 功能再補 i18n。

## COPY-014：深度內容（葡萄酒/威士忌/調酒知識擴充）

- **狀態**：可選。課程內容擴充屬長期內容產出；見 `data/courses` 既有結構。
- **驗收**：可選。

## COPY-015：KOL/合作頁文案與 CTA

- **狀態**：可選。若有 learn/kol 或贊助頁，需文案與 CTA 一致。
- **驗收**：可選。

---

**關鍵檔案**：`src/app/pricing/page.tsx`、`config/pricing.config.ts`、`messages/*.json`（pricing.*）、`data/courses/*.json`、`src/lib/gamification.ts`（BADGE_LABELS）、`src/app/learn/badges/page.tsx`、privacy/terms 頁面。
