/**
 * CLEAN-023: Shared form validation library.
 * Reusable validation functions for forms across the app.
 * All return { valid: boolean; error?: string } for UI display.
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

const OK: ValidationResult = { valid: true }
const fail = (error: string): ValidationResult => ({ valid: false, error })

// ── Email ──
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function validateEmail(value: string): ValidationResult {
  if (!value.trim()) return fail('請輸入電子郵件')
  if (!EMAIL_REGEX.test(value)) return fail('電子郵件格式無效')
  return OK
}

// ── Password ──
export function validatePassword(value: string, minLength = 8): ValidationResult {
  if (!value) return fail('請輸入密碼')
  if (value.length < minLength) return fail(`密碼至少需 ${minLength} 個字元`)
  if (!/[A-Z]/.test(value)) return fail('密碼需包含至少一個大寫字母')
  if (!/[0-9]/.test(value)) return fail('密碼需包含至少一個數字')
  return OK
}

// ── Display Name ──
export function validateDisplayName(value: string): ValidationResult {
  const trimmed = value.trim()
  if (!trimmed) return fail('請輸入暱稱')
  if (trimmed.length < 2) return fail('暱稱至少需 2 個字元')
  if (trimmed.length > 30) return fail('暱稱不可超過 30 個字元')
  return OK
}

// ── Required ──
export function validateRequired(value: string, fieldName = '此欄位'): ValidationResult {
  if (!value.trim()) return fail(`${fieldName}為必填`)
  return OK
}

// ── URL ──
export function validateUrl(value: string): ValidationResult {
  if (!value.trim()) return OK // optional
  try {
    new URL(value)
    return OK
  } catch {
    return fail('請輸入有效的網址')
  }
}

// ── Number Range ──
export function validateNumberRange(value: number, min: number, max: number, fieldName = '數值'): ValidationResult {
  if (Number.isNaN(value)) return fail(`${fieldName}必須為數字`)
  if (value < min) return fail(`${fieldName}不可小於 ${min}`)
  if (value > max) return fail(`${fieldName}不可大於 ${max}`)
  return OK
}

// ── Compose: run multiple validators, return first failure ──
export function composeValidators(
  ...validators: (() => ValidationResult)[]
): ValidationResult {
  for (const v of validators) {
    const result = v()
    if (!result.valid) return result
  }
  return OK
}
