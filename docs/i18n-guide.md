# i18n 指南（I18N-15）

本專案使用 client-side 語系切換，六語系：繁中（zh-TW）、簡中（zh-CN）、粵語（yue）、英（en）、日（ja）、韓（ko）。

## 如何新增語系

1. 在 `src/lib/i18n/config.ts` 的 `locales` 陣列加入新 locale 代碼（如 `'th'`）。
2. 在 `localeNames` 加入對應顯示名稱。
3. 在 `messages/` 下新增 `{locale}.json`（可複製 `zh-TW.json` 再翻譯）。
4. 在 `src/lib/i18n/messages.ts` 匯入新 JSON 並加入 `messages` 物件。

## 如何新增 key

1. 在 **每個** locale 的 `messages/*.json` 中加上同一 key，建議先改 `zh-TW.json` 再補其他語系。
2. Key 使用點號路徑，例如：`partyRoom.unlock12Players`、`error.retry`。
3. 命名空間建議：`common.*`、`nav.*`、`footer.*`、`pricing.*`、`partyRoom.*`、`scriptMurder.*` 等，避免重複。
4. 在元件內用 `const { t } = useTranslation()`，再以 `t('namespace.key')` 取值；缺 key 時會先回傳 defaultLocale（zh-TW）對應值，再無則回傳 key 本身。

## JSON 結構

- 頂層為命名空間物件：`common`、`nav`、`partyRoom`、`scriptMurder` 等。
- 值為字串；可含插值佔位，例如 `"playersCount": "{{current}}/{{max}} 人"`，由前端以字串替換或日後擴充。
- 各 locale 的 key 集合應盡量一致，以利 fallback 與 build 時檢查缺失 key。

## I18N-001：關鍵流程無硬編碼中文

- 登入、訂閱、派對房等關鍵流程文案皆使用 `t('namespace.key')`，勿寫死中文。
- 登入頁已將錯誤訊息、aria-label、placeholder 等改為 i18n key（見 `login.*`）。

## I18N-006：課程與遊戲名稱可譯策略

- **策略一（messages）**：課程名稱與章節標題可置於 `messages/learn`（如 `learn.courseTitle.*`、章節標題與描述）；遊戲顯示名稱可置於 `messages/games`（如 `games.gameName.kingsCup`）。前端以 `t('learn.xxx')`、`t('games.xxx')` 讀取，與現有 key 命名一致。
- **策略二（後台欄位）**：若課程/遊戲由後台或 CMS 管理，可於資料表或 API 提供多語欄位（如 `title_zh_tw`、`title_en`），依當前 locale 選欄位回傳；與 messages 並存時需約定優先順序（例如 API 優先，缺則 fallback messages）。
- **現狀**：目前多為前端常數或 config；新增課程/遊戲時請擇一納入 messages 或後台多語欄位。

## I18N-009：驗證訊息（Zod 等）多語

- 表單驗證錯誤可集中於 `common.validation.*` 或各頁 namespace 下 `validation.*`，Zod 的 `message` 改為 `t('key')` 或透過 `refine` 回傳 t() 的結果。

## I18N-010：語言切換器無閃爍與路徑一致

- 語系由 cookie 持久化，切換時不變更 URL 路徑（無 locale prefix），故路徑一致。
- 避免閃爍：I18nProvider 於 mounted 後才從 cookie 讀取 locale；LocaleSwitcher 使用 context 的 locale 即可。

## I18N-011：多語 E2E 抽樣（至少 en + zh-TW）

- **作法**：關鍵路徑 E2E（critical-paths、persona-flows）可依專案需求以不同 locale 執行；可於 playwright 設定 `projects` 或 test 內設定 cookie `cheersin_locale=en` 或 `zh-TW` 後跑同一流程，確保至少 en 與 zh-TW 各跑一輪。
- **可選**：在 CI 中新增一 job 以 `zh-TW` 與 `en` 各跑 critical-paths。

## I18N-007：動態文案參數化

- 「第 N 題」等動態文案應使用 `t('key', { current, total })` 或 `interpolate(t('key'), { n })`，勿字串拼接。可於 messages 新增 `quiz.progressLabel`、`common.questionOrdinal` 等 key 並傳入參數。

## I18N-012：i18n 貢獻與 key 命名文件

- 本文件（i18n-guide.md）即為 key 命名與貢獻說明；新增 key 時請同步更新「如何新增 key」與命名空間列表。
- 另見 `docs/i18n-key-naming.md` 審計規範。
- **複數（Plural）**：若需 one/other 複數形式，可於 messages 使用 `key_one` / `key_other` 或 `{{count}}` 參數化，由元件依 count 選 key 或傳入 t()。

## 機器翻譯（MT）腳本（全站 50 項 i18n 計畫 Part A）

- **腳本**：`scripts/translate-messages.mjs`；npm：`npm run translate:messages -- --source=zh-TW --target=ja`（依序可跑 ja、ko、yue）。
- **環境變數**：`GOOGLE_TRANSLATE_API_KEY`（Google Cloud Translation API v2）或 `LIBRETRANSLATE_API_KEY` + 選填 `LIBRETRANSLATE_URL`。設定其一後執行即可產出對應語系 JSON。
- **保留佔位**：腳本會保留 `{{key}}` 不譯；產出後請以 `npm run check:i18n:all` 驗收。

## 全站 6 語系 key 驗收

- 執行 `npm run check:i18n:all`（即 `check:i18n --full`）通過即表示 6 語系 key 與 zh-TW 一致。見 `docs/i18n-validation.md`。
- **Part C 命名空間驗收**：產出 MT 後依 `docs/i18n-namespace-verification.md` 對 ja/ko/yue 逐組抽檢（10 組 × 3 語系 = 30 項）。

## 相關檔案

- `src/lib/i18n/config.ts` — 語系列表、defaultLocale、cookie key
- `src/lib/i18n/messages.ts` — 匯總各 locale JSON
- `src/contexts/I18nContext.tsx` — Provider、`t()`、缺 key 時 defaultLocale → en → key fallback（I18N-003）
- `messages/*.json` — 各語系文案
- `docs/i18n-key-naming.md` — key 命名空間與審計規範
- `docs/i18n-namespace-verification.md` — Part C 命名空間驗收清單（任務 21–50）
- `src/components/ui/LocaleSwitcher.tsx` — 語系切換下拉，aria-label 已支援多語
