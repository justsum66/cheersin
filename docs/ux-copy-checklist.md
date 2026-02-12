# UX 與 COPY 檢查清單（Phase 2）

對應 TASKS-170 Batch 4：UX-001～006、COPY-001/002/007/008。

## UX-001：主要頁面載入有 skeleton/loading

- [x] 根 `loading.tsx`、`quiz`、`learn`、`learn/knowledge`、`assistant`、`games` 已有 loading/skeleton
- [x] `pricing`、`login` 已新增 `loading.tsx`，避免白屏

## UX-002：表單與 API 錯誤有明確回饋

- [x] 登入/表單錯誤：inline `role="alert"` + 頂部錯誤區；API 錯誤以 toast（react-hot-toast）或 error boundary 呈現
- [ ] 確認關鍵 API（訂閱、派對房 join）失敗時有 toast 或頁面提示，非僅 console

## UX-003：觸控目標至少 48px

- [x] 全站 CTA 與按鈕使用 `min-h-[48px]` 或 `games-touch-target`；見 globals.css 與元件

## UX-004：手機底部導航不被鍵盤完全遮擋

- [ ] 鍵盤彈起時，底部導航可透過 `scrollIntoView` 或 `visualViewport` 保持可操作；必要時於輸入框 focus 時捲動

## UX-005：設計 token 一致

- [x] `globals.css` :root 使用 `--radius-*`、`--btn-padding-*`、`--text-*`、`--space-*` 等，對齊 `src/lib/design-tokens.ts`，無 magic number

## UX-006：圖示系統統一（lucide 單一來源）

- [x] 專案僅使用 `lucide-react`，未混用 heroicons / react-icons / MUI icons

## COPY-001：首頁 hero CTA 文案轉換導向

- [ ] 首頁 hero 主 CTA 文案明確傳達價值主張（如「開始檢測」「探索靈魂之酒」），並導向 quiz 或主要轉換路徑

## COPY-002：登入/註冊頁說明與信任文案

- [x] 登入頁文案已 i18n（login.*），含歡迎、導向、錯誤訊息；可再補信任/隱私一句於 footer

## COPY-007：派對房與劇本殺 onboarding 清晰

- [ ] 首次進入派對房/劇本殺有簡短步驟或提示，可完成「建立→邀請→開始」；文案見 `partyRoom.*`、`scriptMurder.*`

## COPY-008：助理/AI 回覆邊界與 fallback 文案

- [ ] 助理無回覆或錯誤時顯示友善 fallback（非技術語）；可統一為 `assistant.errorFallback`、`assistant.emptyReply` 等 key
