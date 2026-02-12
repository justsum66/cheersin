/**
 * I18N-005：API 錯誤訊息多語 — 依 error.code 取 t(`apiErrors.${code}`)，無則用 getErrorMessage
 */
import { getErrorCode, getErrorMessage } from './api-response'

type Translate = (key: string) => string

/** 若有 code 且存在對應 apiErrors key 則回傳多語，否則回傳 API message 或 fallback */
export function getDisplayErrorMessage(
  data: unknown,
  t: Translate,
  fallback: string
): string {
  const code = getErrorCode(data)
  if (code) {
    const key = `apiErrors.${code}`
    const translated = t(key)
    if (translated !== key) return translated
  }
  return getErrorMessage(data, fallback)
}
