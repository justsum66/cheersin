# UX 與 COPY 檢查清單（Phase 2）

對應 TASKS-170 Batch 4：UX-001～006、COPY-001/002/007/008。

## UX-001：主要頁面載入有 skeleton/loading

- [x] 根 `loading.tsx`、`quiz`、`learn`、`learn/knowledge`、`assistant`、`games` 已有 loading/skeleton
- [x] `pricing`、`login` 已新增 `loading.tsx`，避免白屏

## UX-002：表單與 API 錯誤有明確回饋

- [x] 登入/表單錯誤：inline `role="alert"` + 頂部錯誤區；API 錯誤以 toast（react-hot-toast）或 error boundary 呈現
- [x] 訂閱失敗：`subscription/page.tsx` 以 toast.error 顯示（loadPlansError、retryLater、建立失敗等）；派對房 join 失敗：`party-room/page.tsx` toast.error / 頁面 `#party-join-error` role="alert"；Games 房間 join 失敗：`GamesPageClient` 以 `roomJoinError` 區塊顯示

## UX-003：觸控目標至少 48px

- [x] 全站 CTA 與按鈕使用 `min-h-[48px]` 或 `games-touch-target`；見 globals.css 與元件

## UX-004：手機底部導航不被鍵盤完全遮擋

- **現狀**：目前未實作輸入 focus 時主動捲動；鍵盤彈起時底部導航可能被遮擋。
- **可選**：輸入框 focus 時可呼叫 `scrollIntoView({ block: 'nearest', behavior: 'smooth' })` 或依 `visualViewport` 調整，使導航保持可操作。
- **建議實作位置**：登入頁（`login/page.tsx` 主要 input）、派對房暱稱輸入（`party-room/page.tsx` 加入房間表單）；擇一或兩處加上 onFocus scrollIntoView 即可顯著改善。
- [x] 已於登入頁（email、password input）onFocus 加 `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`，鍵盤彈起時輸入區可捲入視窗，利於底部導航可操作。

## UX-005：設計 token 一致

- [x] `globals.css` :root 使用 `--radius-*`、`--btn-padding-*`、`--text-*`、`--space-*` 等，對齊 `src/lib/design-tokens.ts`，無 magic number

## UX-006：圖示系統統一（lucide 單一來源）

- [x] 專案僅使用 `lucide-react`，未混用 heroicons / react-icons / MUI icons

## UX-007：載入與錯誤狀態與設計系統一致

- [x] 各路由 `loading.tsx`、`error.tsx` 使用 WineGlassLoading、ErrorFallback 或設計 token（primary/secondary、radius）；樣式與設計系統一致

## COPY-001：首頁 hero CTA 文案轉換導向

- [x] 首頁 hero 主 CTA 已導向 quiz/主要轉換（如「開始檢測」「探索靈魂之酒」）；見 HomePageClient

## COPY-002：登入/註冊頁說明與信任文案

- [x] 登入頁文案已 i18n（login.*），含歡迎、導向、錯誤訊息；已補 `login.trustPrivacy` 信任/隱私一句

## COPY-007：派對房與劇本殺 onboarding 清晰

- [x] 派對房頁使用 `partyRoom.onboardingSteps`；劇本殺大廳與房間使用 `scriptMurder.onboardingSteps`；簡短步驟提示

## COPY-008：助理/AI 回覆邊界與 fallback 文案

- [x] 助理錯誤使用 `assistant.errorFallback`；空回覆/無文字使用 `assistant.emptyReply`；側欄與氣泡一致
