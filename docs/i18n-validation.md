# I18N 驗證訊息（I18N-009）

表單與 API 錯誤訊息多語對應方式。

## I18N-004：日期與數字依 locale 格式化

- **現狀**：`src/lib/formatters.ts` 已支援 `locale` 參數（formatDate、formatTime、formatDateTime、formatRelative、formatNumber、formatCurrency、formatPercent），預設 zh-TW；呼叫處可傳入 `useTranslation().locale`。
- **驗收**：[x] formatters 已支援 locale；顯示處傳入當前語系即可。

## 全站語系 key 覆蓋率

- **驗收**：全站 6 語系（en、ja、ko、yue、zh-CN、zh-TW）key 覆蓋率以 `npm run check:i18n:all`（即 `check:i18n --full`）通過為準；參考語系為 zh-TW。
- **補齊**：若某語系缺 key，可執行 `node scripts/merge-i18n-keys.mjs <locale>` 從 zh-TW 合併缺失 key，再依序翻譯。

## API 錯誤（apiErrors.*）

- **用法**：`getDisplayErrorMessage(data, t, fallback)`（`@/lib/api-error-i18n`）會依 API 回傳的 `error.code` 取 `t(\`apiErrors.${code}\`)`。
- **messages**：`apiErrors.INTERNAL_ERROR`、`apiErrors.INVALID_JSON`、`apiErrors.UNAUTHORIZED`、`apiErrors.NOT_FOUND`、`apiErrors.ROOM_NOT_FOUND`、`apiErrors.TURNSTILE_FAILED` 等已於 en/zh-TW/zh-CN 定義。
- **新增 code**：若 API 回傳新 code，請於各語系 `messages/*.json` 的 `apiErrors` 下補 key。

## 表單驗證（validation.*）

- **messages**：`validation.required`、`validation.email` 已於 en/zh-TW/zh-CN 定義，可供表單元件使用。
- **用法**：表單元件或 Zod 的 `errorMap` 可回傳 `t('validation.required')`、`t('validation.email')`；Zod schema 搭配 `getErrorMap(t)`（若有實作）可將驗證錯誤對應至多語。
- **擴充**：若需 `minLength`、`maxLength` 等，可於 messages 新增 `validation.minLength`、`validation.maxLength`（含 `{{count}}` 參數），並於 validators / useForm 使用 t() 產出訊息。
