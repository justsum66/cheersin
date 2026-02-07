/**
 * UX_LAYOUT_200 #159：必填未填捲動至第一個錯誤 — 表單送出時捲動至第一個無效欄位或錯誤訊息
 * DEDUP #11 統一流程：表單送出 → scrollToFirstError(container) → 焦點至 [aria-invalid="true"] 或 .field-error；
 * 欄位驗證失敗時設 aria-invalid="true"、FormFieldError 或 role="alert"，並用 errors.config ERROR_FORM_HEADING。
 */

/** 捲動至表單內第一個無效欄位（aria-invalid）或第一個 .field-error / [role="alert"] */
export function scrollToFirstError(container: HTMLElement | null): boolean {
  if (!container) return false
  const invalid = container.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (invalid) {
    invalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
    invalid.focus({ preventScroll: false })
    return true
  }
  const errorEl = container.querySelector<HTMLElement>('.field-error, [role="alert"]')
  if (errorEl) {
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const associated = container.querySelector<HTMLElement>('[aria-describedby]')
    if (associated) associated.focus({ preventScroll: false })
    return true
  }
  return false
}
