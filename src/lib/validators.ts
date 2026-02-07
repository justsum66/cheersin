/**
 * G192 通用驗證函數
 * Email、字長、必填等
 */

/** Email 格式（寬鬆） */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** 非空字串 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** 字長範圍 */
export function isLengthBetween(value: string, min: number, max: number): boolean {
  const len = value.trim().length
  return len >= min && len <= max
}

/** 數字範圍 */
export function isNumberBetween(value: unknown, min: number, max: number): value is number {
  const n = Number(value)
  return Number.isFinite(n) && n >= min && n <= max
}

/** 安全整數 */
export function isSafeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number.isSafeInteger(value)
}

/** P0-07：陣列長度在範圍內 */
export function isArrayLengthBetween(value: unknown, min: number, max: number): value is unknown[] {
  return Array.isArray(value) && value.length >= min && value.length <= max
}

/** P2-23：值在允許清單內 */
export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

/** P2-23：物件 key 數量在範圍內（防超大 key 數） */
export function isSafeObjectKeys(obj: unknown, maxKeys: number): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && Object.keys(obj).length <= maxKeys
}
