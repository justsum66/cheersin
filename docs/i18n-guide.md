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

## I18N-006：課程與遊戲名稱/描述可譯或後台

- 策略：目前課程/遊戲名稱多為前端的常數或 config；若需多語可改為從 messages 的 `learn.courses.*`、`games.*` 讀取，或後台 CMS 多語欄位。

## I18N-009：驗證訊息（Zod 等）多語

- 表單驗證錯誤可集中於 `common.validation.*` 或各頁 namespace 下 `validation.*`，Zod 的 `message` 改為 `t('key')` 或透過 `refine` 回傳 t() 的結果。

## I18N-010：語言切換器無閃爍與路徑一致

- 語系由 cookie 持久化，切換時不變更 URL 路徑（無 locale prefix），故路徑一致。
- 避免閃爍：I18nProvider 於 mounted 後才從 cookie 讀取 locale；LocaleSwitcher 使用 context 的 locale 即可。

## 相關檔案

- `src/lib/i18n/config.ts` — 語系列表、defaultLocale、cookie key
- `src/lib/i18n/messages.ts` — 匯總各 locale JSON
- `src/contexts/I18nContext.tsx` — Provider、`t()`、缺 key 時 defaultLocale fallback
- `messages/*.json` — 各語系文案
- `docs/i18n-key-naming.md` — I18N-08：key 命名空間與審計規範
- `src/components/ui/LocaleSwitcher.tsx` — 語系切換下拉，aria-label 已支援多語
