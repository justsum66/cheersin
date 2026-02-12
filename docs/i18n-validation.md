# I18N 驗證訊息（I18N-009）

表單與 API 錯誤訊息多語對應方式。

## API 錯誤（apiErrors.*）

- **用法**：`getDisplayErrorMessage(data, t, fallback)`（`@/lib/api-error-i18n`）會依 API 回傳的 `error.code` 取 `t(\`apiErrors.${code}\`)`。
- **messages**：`apiErrors.INTERNAL_ERROR`、`apiErrors.INVALID_JSON`、`apiErrors.UNAUTHORIZED`、`apiErrors.NOT_FOUND`、`apiErrors.ROOM_NOT_FOUND`、`apiErrors.TURNSTILE_FAILED` 等已於 en/zh-TW/zh-CN 定義。
- **新增 code**：若 API 回傳新 code，請於各語系 `messages/*.json` 的 `apiErrors` 下補 key。

## 表單驗證（validation.*）

- **messages**：`validation.required`、`validation.email` 已於 en/zh-TW/zh-CN 定義，可供表單元件使用。
- **用法**：表單元件或 Zod 的 `errorMap` 可回傳 `t('validation.required')`、`t('validation.email')`；Zod schema 搭配 `getErrorMap(t)`（若有實作）可將驗證錯誤對應至多語。
- **擴充**：若需 `minLength`、`maxLength` 等，可於 messages 新增 `validation.minLength`、`validation.maxLength`（含 `{{count}}` 參數），並於 validators / useForm 使用 t() 產出訊息。
