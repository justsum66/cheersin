# 回歸測試報告 — 關鍵流程

**範圍**：登入、訂閱、測驗、助理、學院、遊戲  
**方式**：Playwright E2E 關鍵路徑 + 手動檢查清單

---

## 1. E2E 關鍵路徑結果（部分）

- **執行**：`npm run test:e2e:critical`（e2e/critical-paths.spec.ts）
- **環境**：WebServer 啟動 dev，chromium-desktop / chromium-mobile / chromium-tablet
- **結果**：執行逾時（180s）；部分用例通過、部分失敗。

### 通過的用例（抽樣）

| 用例 | 專案 | 狀態 |
|------|------|------|
| Quiz 頁可達且顯示標題與開始按鈕 | chromium-desktop | ✅ |
| 首頁點擊開始檢測可進入 Quiz | chromium-desktop | ✅ |
| Quiz 可從 intro 進入星座選擇並完成一題 | chromium-desktop | ✅ |
| 登入頁可載入且表單可見 | chromium-desktop | ✅ |
| 定價頁可載入且方案可見 | chromium-desktop | ✅ |
| 定價頁 FAQ 區塊可展開 | chromium-desktop | ✅ |
| 訂閱管理頁可達 | chromium-desktop | ✅ |
| 取消訂閱頁可達 | chromium-desktop | ✅ |
| 關鍵路徑：登入頁→定價→訂閱管理→取消頁 | chromium-desktop | ✅ |

### 失敗／不穩定（抽樣）

| 用例 | 可能原因 |
|------|----------|
| 首頁頂部導航可見且可點擊進入各區 | 主導航 aria-label 或 timeout |
| 首頁底部導航（手機）可見且可點 | viewport/載入時序 |
| Quiz 完整流程可走完並到達結果頁 | 18 題點擊時序或 timeout |
| 登入頁有「以 Google 繼續」或密碼登入 | 選擇器與實際按鈕文案 |
| mobile/tablet 多個用例 | WebServer ENOENT（.next build manifest），dev 與 E2E 並行 |

### WebServer 錯誤

- `ENOENT: app-build-manifest.json`、`_buildManifest.js.tmp` — dev 使用 Turbopack 時與 E2E 並行可能產生；建議 CI 使用 `npm run build && npm run start` 再跑 E2E，或 `reuseExistingServer` 搭配預先啟動的 dev。

---

## 2. 手動回歸檢查清單

請在實機或 DevTools 依序執行並勾選。

### 登入

- [ ] `/login` 可開啟，表單（Email、密碼）可見
- [ ] 必填欄位有 * 標記，送出空欄位有錯誤提示
- [ ] 錯誤區塊 role="alert"、可見
- [ ] 魔法連結區塊有 h3「寄送登入連結」
- [ ] （若有帳密）登入成功後 Toast + 導向

### 訂閱

- [ ] `/pricing` 可開啟，方案卡與月繳/年繳切換可見
- [ ] 推薦方案有視覺強調（ring/border）
- [ ] FAQ 可展開/收合
- [ ] `/subscription`、`/subscription/cancel` 可開啟
- [ ] 取消頁主 CTA「保留方案」、次要「訂閱管理」層次清楚

### 測驗

- [ ] `/quiz` 可開啟，intro 有單一主 CTA「開始檢測」
- [ ] 可選酒款推薦/只要遊戲 → 星座 → 題目
- [ ] 進度條「第 x/y 題」可見、tabular-nums
- [ ] 選項可點、可進入下一題
- [ ] 完成後結果頁（靈魂之酒或遊戲推薦）可見

### 助理

- [ ] `/assistant` 可開啟，輸入區在底部、safe-area
- [ ] 快速回覆/建議問題按鈕 ≥48px、可點
- [ ] Ctrl+Enter 送出有提示
- [ ] 語音按鈕錄音中為停止圖示（Square）、否則 Mic

### 學院

- [ ] `/learn` 可開啟，課程列表與篩選可用
- [ ] 進入課程後目錄與當前章節高亮
- [ ] 完成章節後有「進度已儲存」Toast（若已實作）

### 遊戲

- [ ] `/games` 可開啟，遊戲大廳列表可見
- [ ] 進入遊戲後規則可展開、Modal 關閉鈕 48px
- [ ] Esc 關閉 Modal、焦點回傳

---

## 3. 建議後續

1. **CI E2E**：使用 `npm run build && npx playwright test e2e/critical-paths.spec.ts --project=chromium-desktop` 並設定 `PLAYWRIGHT_BASE_URL` 指向已啟動的 server，避免 dev 與 E2E 搶 .next。
2. **不穩定用例**：放寬主導航/底部導航的選擇器或 timeout；Quiz 完整流程可拆成較短步驟或增加等待條件。
3. **手動**：每次發版前跑一輪上列手動清單。
