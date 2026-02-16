/**
 * P0-27: Validators unit tests
 */
import { describe, it, expect } from 'vitest'
import {
  isEmail,
  isNonEmptyString,
  isLengthBetween,
  isNumberBetween,
  isSafeInteger,
  isArrayLengthBetween,
  isOneOf,
  isSafeObjectKeys,
} from './validators'

describe('isEmail', () => {
  it('accepts valid emails', () => {
    expect(isEmail('user@example.com')).toBe(true)
    expect(isEmail('a@b.co')).toBe(true)
    expect(isEmail('test.user+tag@domain.org')).toBe(true)
  })
  it('rejects invalid emails', () => {
    expect(isEmail('')).toBe(false)
    expect(isEmail('not-an-email')).toBe(false)
    expect(isEmail('@missing.com')).toBe(false)
    expect(isEmail('no-domain@')).toBe(false)
    expect(isEmail('spaces in@email.com')).toBe(false)
  })
})

describe('isNonEmptyString', () => {
  it('returns true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true)
    expect(isNonEmptyString('a')).toBe(true)
  })
  it('returns false for empty or non-strings', () => {
    expect(isNonEmptyString('')).toBe(false)
    expect(isNonEmptyString('   ')).toBe(false)
    expect(isNonEmptyString(null)).toBe(false)
    expect(isNonEmptyString(undefined)).toBe(false)
    expect(isNonEmptyString(42)).toBe(false)
    expect(isNonEmptyString(true)).toBe(false)
  })
})

describe('isLengthBetween', () => {
  it('checks string length range', () => {
    expect(isLengthBetween('abc', 1, 5)).toBe(true)
    expect(isLengthBetween('a', 1, 1)).toBe(true)
    expect(isLengthBetween('', 1, 5)).toBe(false)
    expect(isLengthBetween('toolong', 1, 3)).toBe(false)
  })
  it('trims before checking', () => {
    expect(isLengthBetween('  a  ', 1, 3)).toBe(true)
  })
})

describe('isNumberBetween', () => {
  it('validates number range', () => {
    expect(isNumberBetween(5, 1, 10)).toBe(true)
    expect(isNumberBetween(1, 1, 10)).toBe(true)
    expect(isNumberBetween(10, 1, 10)).toBe(true)
    expect(isNumberBetween(0, 1, 10)).toBe(false)
    expect(isNumberBetween(11, 1, 10)).toBe(false)
  })
  it('rejects non-numbers', () => {
    expect(isNumberBetween('notnum', 1, 10)).toBe(false)
    expect(isNumberBetween(NaN, 1, 10)).toBe(false)
    expect(isNumberBetween(Infinity, 1, 10)).toBe(false)
  })
})

describe('isSafeInteger', () => {
  it('validates safe integers', () => {
    expect(isSafeInteger(42)).toBe(true)
    expect(isSafeInteger(0)).toBe(true)
    expect(isSafeInteger(-1)).toBe(true)
  })
  it('rejects non-safe-integers', () => {
    expect(isSafeInteger(3.14)).toBe(false)
    expect(isSafeInteger(NaN)).toBe(false)
    expect(isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false)
  })
})

describe('isArrayLengthBetween', () => {
  it('validates array length range', () => {
    expect(isArrayLengthBetween([1, 2], 1, 5)).toBe(true)
    expect(isArrayLengthBetween([], 0, 5)).toBe(true)
    expect(isArrayLengthBetween([], 1, 5)).toBe(false)
    expect(isArrayLengthBetween([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false)
  })
  it('rejects non-arrays', () => {
    expect(isArrayLengthBetween('notarray', 0, 5)).toBe(false)
    expect(isArrayLengthBetween(null, 0, 5)).toBe(false)
  })
})

describe('isOneOf', () => {
  it('checks value in allowed list', () => {
    expect(isOneOf('a', ['a', 'b', 'c'] as const)).toBe(true)
    expect(isOneOf('c', ['a', 'b', 'c'] as const)).toBe(true)
  })
  it('rejects values not in list', () => {
    expect(isOneOf('z', ['a', 'b'] as const)).toBe(false)
    expect(isOneOf('', ['a'] as const)).toBe(false)
  })
  it('rejects non-strings', () => {
    expect(isOneOf(42 as unknown, ['a'] as const)).toBe(false)
  })
})

describe('isSafeObjectKeys', () => {
  it('validates object key count', () => {
    expect(isSafeObjectKeys({ a: 1, b: 2 }, 5)).toBe(true)
    expect(isSafeObjectKeys({}, 5)).toBe(true)
    expect(isSafeObjectKeys({ a: 1, b: 2, c: 3 }, 2)).toBe(false)
  })
  it('rejects non-objects', () => {
    expect(isSafeObjectKeys(null, 5)).toBe(false)
    expect(isSafeObjectKeys([1, 2], 5)).toBe(false)
    expect(isSafeObjectKeys('str', 5)).toBe(false)
  })
})
